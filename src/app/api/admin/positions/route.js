import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

// ดึงตำแหน่งทั้งหมด (เฉพาะที่ยัง active)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const positions = await prisma.position.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(positions)
    } catch (error) {
        console.error('Error fetching positions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// สร้างตำแหน่งใหม่
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description } = body

        // ตรวจสอบว่ามีการระบุชื่อตำแหน่งไหม
        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'ชื่อตำแหน่งจำเป็นต้องระบุ' }, { status: 400 })
        }

        // ตรวจสอบว่าชื่อตำแหน่งซ้ำไหม
        const existingPosition = await prisma.position.findUnique({
            where: { name: name.trim() }
        })

        if (existingPosition) {
            return NextResponse.json({ error: 'ชื่อตำแหน่งนี้มีอยู่แล้วในระบบ' }, { status: 400 })
        }

        // สร้างตำแหน่งใหม่
        const newPosition = await prisma.position.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null
            }
        })

        return NextResponse.json(newPosition, { status: 201 })
    } catch (error) {
        console.error('Error creating position:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
