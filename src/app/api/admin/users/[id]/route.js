import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        // ตรวจสิทธิ์ ADMIN
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id

        // หา user และ signUpUser
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { signUpUser: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // ป้องกันไม่ให้ลบตัวเอง
        if (user.id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // ลบ signUpUser (ถ้ามี)
        if (user.signUpUserId) {
            await prisma.signUpUser.delete({ where: { id: user.signUpUserId } })
        }

        // ลบ renewalRequests ของ user (ถ้า schema ไม่มี cascade)
        await prisma.renewalRequest.deleteMany({ where: { userId } })

        // ลบ user หลัก (cascade จะลบ DomainRequests + Domains ให้อัตโนมัติ)
        await prisma.user.delete({ where: { id: userId } })

        return NextResponse.json({
            message: 'User and related data deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
