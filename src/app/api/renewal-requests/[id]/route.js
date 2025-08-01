import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    const renewalRequestId = params.id

    // Get the renewal request
    const renewalRequest = await prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId },
      include: {
        domain: {
          include: {
            domainRequest: true
          }
        }
      }
    })

    if (!renewalRequest) {
      return NextResponse.json({ error: 'Renewal request not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Update renewal request status
      await prisma.renewalRequest.update({
        where: { id: renewalRequestId },
        data: {
          status: 'APPROVED',
          approvalCooldownAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour cooldown
        }
      })

      // Update domain expiry date
      await prisma.domainRequest.update({
        where: { id: renewalRequest.domain.domainRequestId },
        data: {
          expiresAt: new Date(renewalRequest.newExpiryDate)
        }
      })

      // If domain was expired or trashed, make it active again
      await prisma.domain.update({
        where: { id: renewalRequest.domainId },
        data: {
          status: 'ACTIVE',
          deletedAt: null,
          trashExpiresAt: null
        }
      })

      return NextResponse.json({
        message: 'Renewal request approved successfully',
        action: 'approved'
      })

    } else if (action === 'reject') {
      // Update renewal request status
      await prisma.renewalRequest.update({
        where: { id: renewalRequestId },
        data: {
          status: 'REJECTED',
          approvalCooldownAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour cooldown
        }
      })

      return NextResponse.json({
        message: 'Renewal request rejected successfully',
        action: 'rejected'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing renewal request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const renewalRequestId = params.id

    // Get the renewal request to check ownership
    const renewalRequest = await prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId }
    })

    if (!renewalRequest) {
      return NextResponse.json({ error: 'Renewal request not found' }, { status: 404 })
    }

    // Check if user has permission to delete this request
    if (session.user.role !== 'ADMIN' && renewalRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบคำขอนี้' }, { status: 403 })
    }

    // Only allow deletion of pending requests
    if (renewalRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'สามารถลบได้เฉพาะคำขอที่ยังรอพิจารณา' }, { status: 400 })
    }

    // Delete the renewal request
    await prisma.renewalRequest.delete({
      where: { id: renewalRequestId }
    })

    return NextResponse.json({
      message: 'ลบคำขอต่ออายุสำเร็จ',
      action: 'deleted'
    })

  } catch (error) {
    console.error('Error deleting renewal request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
