import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        // ตรวจสอบว่ามีการส่งรหัสผ่านเดิมและใหม่มาหรือไม่
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // ตรวจสอบความยาวของรหัสผ่านใหม่
        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
        }

        // ดึงข้อมูลผู้ใช้จากฐานข้อมูลโดยใช้ ID จาก session
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // ตรวจสอบว่ารหัสผ่านเดิมถูกต้องหรือไม่ (ในที่นี้เป็น plain text)
        if (user.password !== currentPassword) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        // อัปเดตรหัสผ่านใหม่
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: newPassword // ยังเป็น plain text ตามข้อกำหนด
            }
        })

        return NextResponse.json({ message: 'Password changed successfully' })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
