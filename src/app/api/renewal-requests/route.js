import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { domainId, newExpiryDate, reason } = body;

    if (!domainId || !newExpiryDate) {
      return NextResponse.json({ error: "กรุณาระบุ domainId และ newExpiryDate" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่า domainId มีอยู่จริง
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) {
      return NextResponse.json({ error: "Domain ไม่ถูกต้อง" }, { status: 400 });
    }

    const newRequest = await prisma.renewalRequest.create({
      data: {
        domainId,
        newExpiryDate: new Date(newExpiryDate),
        reason,
        status: 'PENDING',
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "ส่งคำขอต่ออายุสำเร็จ",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating renewal request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET handler
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const url = new URL(request.url);
    const my = url.searchParams.get("my") === "true";

    const whereClause = !isAdmin && my ? { userId } : {};

    const renewalRequests = await prisma.renewalRequest.findMany({
      where: whereClause,
      include: {
        domain: { include: { domainRequest: true } },
        user: { select: { username: true } },
      },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json(renewalRequests);
  } catch (error) {
    console.error("Error fetching renewal requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
