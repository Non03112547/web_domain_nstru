import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// APPROVE or REJECT or DELETE
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action } = body

        console.log('PUT USER params.id:', params.id)
        console.log('Action:', action)
        console.log('User role:', session.user.role, 'username:', session.user.username)

        if (!['approve', 'reject', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Only admin can approve/reject/delete
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // หา request user ตาม id
        const requestUser = await prisma.signUpUser.findUnique({
            where: { id: params.id },
            include: { user_record: true }
        })

        if (!requestUser) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // กรณี delete
        if (action === "delete") {
            await prisma.signUpUser.delete({ where: { id: params.id } })
            console.log('USER permanently deleted:', params.id)
            return NextResponse.json({ message: 'ลบคำขอใช้งานออกจากระบบถาวรเรียบร้อยแล้ว' })
        }

        // กำหนดสถานะใหม่
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

        // Update request status
        const updatedRequest = await prisma.signUpUser.update({
            where: { id: params.id },
            data: { status }
        })

        console.log('Updated USER status:', updatedRequest.status)

        // ถ้าอนุมัติ และยังไม่มี user_record → สร้าง User จริง
        if (action === 'approve' && !requestUser.user_record) {
            await prisma.user.create({
                data: {
                    username: requestUser.username,
                    password: requestUser.password,
                    role: requestUser.role,
                    signUpUserId: requestUser.id
                }
            })
            console.log('USER record created for request:', params.id)
        }

        return NextResponse.json(updatedRequest)
    } catch (error) {
        console.error('Error updating USER:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
