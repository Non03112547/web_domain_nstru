import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    const renewalRequestId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action ต้องเป็น approve หรือ reject เท่านั้น' }, { status: 400 });
    }

    const renewalRequest = await prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId },
      include: {
        domain: {
          include: {
            domainRequest: true,
          },
        },
      },
    });

    if (!renewalRequest) {
      return NextResponse.json({ error: 'ไม่พบคำขอต่ออายุ' }, { status: 404 });
    }

    if (action === 'approve') {
      if (!renewalRequest.newExpiryDate) {
        return NextResponse.json({ error: 'ไม่พบวันหมดอายุใหม่ในคำขอ' }, { status: 400 });
      }

      // อัปเดตสถานะเป็น APPROVED
      await prisma.renewalRequest.update({
        where: { id: renewalRequestId },
        data: {
          status: 'APPROVED',
          approvalCooldownAt: new Date(Date.now() + 60 * 60 * 1000), // 1 ชั่วโมง
        },
      });

      // อัปเดตวันหมดอายุของ domain
      await prisma.domainRequest.update({
        where: { id: renewalRequest.domain.domainRequestId },
        data: {
          expiresAt: new Date(renewalRequest.newExpiryDate),
        },
      });

      // คืนสถานะ ACTIVE ให้ domain ถ้าเคยถูกลบหรือย้ายถังขยะ
      await prisma.domain.update({
        where: { id: renewalRequest.domainId },
        data: {
          status: 'ACTIVE',
          deletedAt: null,
          trashExpiresAt: null,
        },
      });

    } else if (action === 'reject') {
      await prisma.renewalRequest.update({
        where: { id: renewalRequestId },
        data: {
          status: 'REJECTED',
          approvalCooldownAt: new Date(Date.now() + 60 * 60 * 1000), // 1 ชั่วโมง
        },
      });
    }

    // ดึงข้อมูลล่าสุดกลับไป
    const updatedRequest = await prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId },
      include: {
        user: { select: { username: true } },
        domain: {
          include: {
            domainRequest: {
              select: {
                domain: true,
                durationType: true,
                expiresAt: true,
                requesterName: true,
                department: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: `Renewal request ${action}ed successfully`,
      action,
      data: updatedRequest,
    });

  } catch (error) {
    console.error('Error processing renewal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const renewalRequestId = params.id;

    const renewalRequest = await prisma.renewalRequest.findUnique({
      where: { id: renewalRequestId },
    });

    if (!renewalRequest) {
      return NextResponse.json({ error: 'ไม่พบคำขอต่ออายุ' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && renewalRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบคำขอนี้' }, { status: 403 });
    }

    if (renewalRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'สามารถลบได้เฉพาะคำขอที่ยังรอพิจารณา' }, { status: 400 });
    }

    await prisma.renewalRequest.delete({
      where: { id: renewalRequestId },
    });

    return NextResponse.json({
      message: 'ลบคำขอต่ออายุสำเร็จ',
      action: 'deleted',
      id: renewalRequestId,
    });

  } catch (error) {
    console.error('Error deleting renewal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
