import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action } = body

        if (action === 'approve' || action === 'reject') {
            // Only admin can approve/reject
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            const domainRequest = await prisma.domainRequest.findUnique({
                where: { id: params.id }
            })

            if (!domainRequest) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 })
            }

            const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

            // Set cooldown time (60 minutes from now)
            const cooldownTime = new Date(Date.now() + 60 * 60 * 1000)

            const updatedRequest = await prisma.domainRequest.update({
                where: { id: params.id },
                data: {
                    status,
                    approvalCooldownAt: cooldownTime
                }
            })

            // If approved, create domain record
            if (action === 'approve') {
                await prisma.domain.create({
                    data: {
                        domainRequestId: params.id,
                        status: 'ACTIVE',
                        lastUsedAt: new Date()
                    }
                })
            }

            return NextResponse.json(updatedRequest)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Error updating request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const domainRequest = await prisma.domainRequest.findUnique({
            where: { id: params.id },
            include: {
                domain_record: true
            }
        })

        if (!domainRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // Check if user owns this request or is admin
        if (domainRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If request is APPROVED and has domain record, handle based on domain status
        if (domainRequest.status === 'APPROVED' && domainRequest.domain_record) {
            // Only admin can manage approved requests
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการคำขอที่อนุมัติแล้ว' },
                    { status: 403 }
                )
            }

            if (domainRequest.domain_record.status === 'TRASHED') {
                // If already in trash, delete permanently
                await prisma.domain.delete({
                    where: { id: domainRequest.domain_record.id }
                })

                // Create deletion log
                await prisma.deletedDomainLog.create({
                    data: {
                        domainName: domainRequest.domain,
                        requesterName: domainRequest.requesterName,
                        department: domainRequest.department,
                        originalCreatedAt: domainRequest.requestedAt,
                        deletedAt: new Date(),
                        reason: 'ลบถาวรโดย Admin',
                        deletedBy: session.user.username
                    }
                })

                return NextResponse.json({ message: 'ลบโดเมนออกจากระบบถาวรเรียบร้อยแล้ว' })
            } else {
                // Move domain to trash
                await prisma.domain.update({
                    where: { id: domainRequest.domain_record.id },
                    data: {
                        status: 'TRASHED',
                        deletedAt: new Date(),
                        trashExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
                    }
                })

                return NextResponse.json({ message: 'คำขอถูกย้ายไปยังถังขยะเรียบร้อยแล้ว' })
            }
        } else {
            // For non-approved requests, delete normally
            // Delete domain record if exists
            if (domainRequest.domain_record) {
                await prisma.domain.delete({
                    where: { id: domainRequest.domain_record.id }
                })
            }

            // Delete request
            await prisma.domainRequest.delete({
                where: { id: params.id }
            })

            return NextResponse.json({ message: 'Request deleted successfully' })
        }
    } catch (error) {
        console.error('Error deleting request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
