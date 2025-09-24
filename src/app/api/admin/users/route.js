import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'   // สำหรับเข้ารหัสรหัสผ่าน

// ================= GET USERS =================
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            include: { position: true },
            orderBy: { createdAt: 'desc' }
        })

        // ส่งกลับเป็น object รวมทั้งสอง array
        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ================= CREATE USER =================
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { username, role, positionId } = body

        // Generate random password (plain text)
        const plainPassword = Math.random().toString(36).slice(-8)

        // Validate required fields
        if (!username || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
        }

        // 🔑 Hash password ก่อนบันทึก
        const hashedPassword = await bcrypt.hash(plainPassword, 10)

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword, // เก็บ hash password เท่านั้น
                role,
                positionId: positionId || null
            },
            include: {
                position: true
            }
        })

        // ส่ง plain password กลับไปให้ admin เพื่อแจ้ง user
        return NextResponse.json({
            user: newUser,
            password: plainPassword
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
