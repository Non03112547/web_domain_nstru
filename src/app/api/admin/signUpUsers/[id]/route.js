import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
// APPROVE or REJECTED 
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action } = body

        console.log('PUT request params.id:', params.id)
        console.log('Action:', action)
        console.log('User role:', session.user.role, 'username:', session.user.username)

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Only admin can approve/reject
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const domainRequest = await prisma.domainRequest.findUnique({
            where: { id: params.id },
            include: { domain_record: true }
        })

        if (!domainRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const cooldownTime = new Date(Date.now() + 60 * 60 * 1000)

        // Update request status
        const updatedRequest = await prisma.domainRequest.update({
            where: { id: params.id },
            data: { status, approvalCooldownAt: cooldownTime }
        })

        console.log('Updated request status:', updatedRequest.status)

        // Create domain record if approved and not exists
        if (action === 'approve' && !domainRequest.domain_record) {
            await prisma.domain.create({
                data: {
                    domainRequestId: params.id,
                    status: 'ACTIVE',
                    lastUsedAt: new Date()
                }
            })
            console.log('Domain record created for request:', params.id)
        }

        return NextResponse.json(updatedRequest)
    } catch (error) {
        console.error('Error updating request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
// delete
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('DELETE request params.id:', params.id)
        console.log('User role:', session.user.role, 'username:', session.user.username)

        const domainRequest = await prisma.domainRequest.findUnique({
            where: { id: params.id },
            include: { domain_record: true }
        })

        if (!domainRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // Check ownership or admin
        if (domainRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If approved with domain_record
        if (domainRequest.status === 'APPROVED' && domainRequest.domain_record) {
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการคำขอที่อนุมัติแล้ว' },
                    { status: 403 }
                )
            }

            const domainId = domainRequest.domain_record?.id

            if (!domainId) {
                return NextResponse.json({ error: 'Domain record not found' }, { status: 404 })
            }

            if (domainRequest.domain_record.status === 'TRASHED') {
                // Permanently delete
                await prisma.domain.delete({ where: { id: domainId } })
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
                console.log('Domain permanently deleted:', domainId)
                return NextResponse.json({ message: 'ลบโดเมนออกจากระบบถาวรเรียบร้อยแล้ว' })
            } else {
                // Move to trash
                await prisma.domain.update({
                    where: { id: domainId },
                    data: {
                        status: 'TRASHED',
                        deletedAt: new Date(),
                        trashExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    }
                })
                console.log('Domain moved to trash:', domainId)
                return NextResponse.json({ message: 'คำขอถูกย้ายไปยังถังขยะเรียบร้อยแล้ว' })
            }
        } else {
            // Delete domain record if exists
            if (domainRequest.domain_record) {
                await prisma.domain.delete({ where: { id: domainRequest.domain_record.id } })
                console.log('Domain record deleted:', domainRequest.domain_record.id)
            }

            // Delete request
            await prisma.domainRequest.delete({ where: { id: params.id } })
            console.log('Domain request deleted:', params.id)
            return NextResponse.json({ message: 'Request deleted successfully' })
        }
    } catch (error) {
        console.error('Error deleting request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
