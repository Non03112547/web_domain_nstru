import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id

        // หา user + signUpUser
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { signUpUser: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // ป้องกันลบตัวเอง
        if (user.id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // ลบทั้งหมดใน transaction
        await prisma.$transaction([
            // ลบ domains ที่เกี่ยวข้องกับ domainRequests ของ user
            prisma.domain.deleteMany({
                where: { domainRequest: { userId } }
            }),

            // ลบ domainRequests ของ user
            prisma.domainRequest.deleteMany({
                where: { userId }
            }),

            // ลบ renewalRequests ของ user (ถ้ามี)
            prisma.renewalRequest.deleteMany({
                where: { userId }
            }),

            // ลบ user
            prisma.user.deleteMany({
                where: { id: userId }
            }),

            // ลบ signUpUser ถ้ามี
            prisma.signUpUser.deleteMany({
                where: { id: user.signUpUserId }
            })
        ])

        return NextResponse.json({ message: 'User and related signUpUser deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
