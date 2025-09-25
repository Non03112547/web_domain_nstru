import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req) {
    const { username, password, confirmPassword, contactP, contactE } = await req.json()

    if (!username || !password || !confirmPassword || !contactP || !contactE) {
        return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    if (password !== confirmPassword) {
        return NextResponse.json({ error: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 })
    }

    const existingUser = await prisma.signUpUser.findUnique({ where: { username } })
    if (existingUser) {
        return NextResponse.json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.signUpUser.create({
        data: { username, password: hashedPassword, contactP, contactE }
    })

    return NextResponse.json({ message: 'สมัครสมาชิกเรียบร้อย รอการอนุมัติ' })
}
