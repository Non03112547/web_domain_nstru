import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request, context) {
    try {
        // await params ตาม Next.js App Router
        const { params } = await context;
        const id = params.id;

        // ตรวจสอบ session
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ดึง action จาก request body
        const body = await request.json()
        const { action } = body

        if (!['approve', 'reject', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // ตรวจสอบ role ADMIN
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // หา signUpUser ตาม id
        const requestUser = await prisma.signUpUser.findUnique({
            where: { id }, // ใช้ตัวแปร id
            include: { user_record: true }
        })

        if (!requestUser) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // DELETE request
        if (action === 'delete') {
            await prisma.signUpUser.delete({ where: { id } })
            return NextResponse.json({ message: 'ลบคำขอใช้งานออกจากระบบถาวรเรียบร้อยแล้ว' })
        }

        // APPROVE / REJECT
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const updatedRequest = await prisma.signUpUser.update({
            where: { id },
            data: { status }
        })

        // สร้าง User จริง ถ้าอนุมัติ และยังไม่มี user_record
        if (action === 'approve' && !requestUser.user_record) {
            const hashedPassword = await bcrypt.hash(requestUser.password, 10)
            await prisma.user.create({
                data: {
                    username: requestUser.username,
                    password: hashedPassword,
                    role: requestUser.role,
                    signUpUserId: requestUser.id
                }
            })
        }

        return NextResponse.json({ message: 'สำเร็จ', data: updatedRequest })

    } catch (error) {
        console.error('Error updating USER:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
