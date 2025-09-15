import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Function to generate random password
function generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Generate new password
        const newPassword = generateRandomPassword()

        // Hash password ก่อนบันทึก
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user's password (บันทึก hash)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return NextResponse.json({
            message: 'Password reset successfully',
            newPassword: newPassword, // ส่งคืนรหัสผ่านจริงให้ admin ใช้แจ้ง user
            username: user.username
        })
    } catch (error) {
        console.error('Error resetting password:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
