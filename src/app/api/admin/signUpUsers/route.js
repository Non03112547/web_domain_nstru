import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'   // สำหรับเข้ารหัสรหัสผ่าน

// ================= GET USERS =================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requestUsers = await prisma.signUpUser.findMany({
            where: { status: 'PENDING' },
            include: { user_record: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users: requestUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const body = await req.json()
        const { username, password, confirmPassword, contactP, contactE } = body

        // ตรวจสอบข้อมูลครบ
        if (!username || !password || !confirmPassword || !contactP || !contactE) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
        }

        // ตรวจสอบรหัสผ่านตรงกัน
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 })
        }

        // ตรวจสอบ username ซ้ำ
        const existingUser = await prisma.signUpUser.findUnique({ where: { username } })
        if (existingUser) {
            return NextResponse.json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' }, { status: 400 })
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10)

        // สร้างผู้ใช้ใหม่ (status = PENDING by default)
        const newUser = await prisma.signUpUser.create({
            data: {
                username,
                password: hashedPassword,
                contactP,
                contactE
            }
        })

        return NextResponse.json({
            message: 'สมัครสมาชิกเรียบร้อย รอการอนุมัติจากแอดมิน',
            userId: newUser.id
        })
    } catch (error) {
        console.error('Sign Up Error:', error)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 })
    }
}