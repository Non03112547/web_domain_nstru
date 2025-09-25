import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function DELETE(request, { params }) {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.role) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // หา Domain ด้วย Domain.id
        let domain = await prisma.domain.findUnique({
            where: { id },
            include: { domainRequest: true }
        })

        // ถ้าไม่เจอ → หา Domain ด้วย DomainRequest.id
        if (!domain) {
            domain = await prisma.domain.findUnique({
                where: { domainRequestId: id },
                include: { domainRequest: true }
            })
        }

        if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 })

        let action = 'moved_to_trash'

        if (domain.status === 'TRASHED' || domain.status === 'EXPIRED') {
            await prisma.domain.delete({ where: { id: domain.id } }) // ใช้ Domain.id ลบจริง
            action = 'permanently_deleted'
        } else {
            const trashDate = new Date()
            const now = new Date()
            trashDate.setDate(trashDate.getDate() + 30)

            // อัปเดต status เป็น TRASHED และตั้ง trashExpiresAt
            await prisma.domain.update({
                where: { id: domain.id },
                data: {
                    deletedAt: now,
                    status: 'TRASHED',
                    trashExpiresAt: trashDate
                }
            })
        }

        return NextResponse.json({ action, domain })
    } catch (error) {
        console.error('Delete Domain Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        )
    }
}
export async function PUT(request, { params }) {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.role) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action, durationType, expiresAt } = body

        if (action !== 'restore') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // หา domain ด้วย Domain.id
        let domain = await prisma.domain.findUnique({
            where: { id },
            include: { domainRequest: true }
        })

        if (!domain) {
            // หา domain ด้วย DomainRequest.id
            domain = await prisma.domain.findUnique({
                where: { domainRequestId: id },
                include: { domainRequest: true }
            })
        }

        if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 })

        // อัพเดท domainRequest
        await prisma.domain.update({
            where: { id: domain.id },
            data: {
                status: 'ACTIVE',
                domainRequest: {
                    update: {
                        durationType,
                        expiresAt: durationType === 'TEMPORARY' ? new Date(expiresAt) : null
                    }
                }
            }
        })

        return NextResponse.json({ success: true, domain })
    } catch (error) {
        console.error('Restore Domain Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        )
    }
}
