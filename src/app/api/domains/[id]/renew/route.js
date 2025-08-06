import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request, { params })
// ใช้งาน request และ id ได้ที่นี่
{
    const { id } = params;

    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { expiresAt } = body
        const requestId = params.id

        if (!expiresAt) {
            return NextResponse.json({ error: 'Expiry date is required' }, { status: 400 })
        }

        // Find the domain request
        const domainRequest = await prisma.domainRequest.findUnique({
            where: { id: requestId },
            include: {
                domain_record: true
            }
        })
    

        if (!domainRequest) {
            return NextResponse.json({ error: 'Domain request not found' }, { status: 404 })
        }

        // Check if user owns this request
        if (domainRequest.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if domain is temporary
        if (domainRequest.durationType !== 'TEMPORARY') {
            return NextResponse.json({ error: 'Only temporary domains can be renewed' }, { status: 400 })
        }

        // Validate new expiry date
        const newExpiryDate = new Date(expiresAt)
        const today = new Date()

        if (newExpiryDate <= today) {
            return NextResponse.json({ error: 'Expiry date must be in the future' }, { status: 400 })
        }

        // Update domain request
        const updatedRequest = await prisma.domainRequest.update({
            where: { id: requestId },
            data: {
                expiresAt: newExpiryDate
            }
        })

        // Update domain record if exists
        if (domainRequest.domain_record) {
            await prisma.domain.update({
                where: { id: domainRequest.domain_record.id },
                data: {
                    status: 'ACTIVE',
                    deletedAt: null,
                    trashExpiresAt: null
                }
            })
        }

        return NextResponse.json(updatedRequest)
    } catch (error) {
        console.error('Error renewing domain:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}