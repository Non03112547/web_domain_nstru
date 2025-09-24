
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req) {
    try {
        const { username, password, contactP, contactE } = await req.json()

        if (!username || !password || !contactP || !contactE) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // ตรวจสอบ username หรือ email ซ้ำ
        const existingUser = await prisma.signUpUser.findFirst({
            where: { OR: [{ username }, { contactE }] }
        })
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // สร้าง SignUpUser
        const newUser = await prisma.signUpUser.create({
            data: {
                username,
                password: hashedPassword,
                contactP,
                contactE,
                role: role || 'USER',
                status: 'PENDING' // รออนุมัติ
            }
        })

        return NextResponse.json(
            { message: 'Sign up successful, please wait for approval', user: { id: newUser.id, username: newUser.username } },
            { status: 201 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}