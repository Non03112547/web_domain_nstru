import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    const url = new URL(request.url);
    const my = url.searchParams.get("my");

    let whereClause = {};

    if (!isAdmin && my) {
      // กรองเฉพาะของ user เอง และ domainId ไม่เป็น null
      whereClause = {
        userId,
        domainId: {
          not: null
        },
      };
    }

    const renewalRequests = await prisma.renewalRequest.findMany({
      where: whereClause,
      include: {
        domain: {
          include: {
            domainRequest: true, // หรือเลือก fields ที่ต้องการ
          }
        },
        user: {
          select: {
            username: true,
          }
        }
      },
      orderBy: {
        requestedAt: "desc"
      }
    });



    return NextResponse.json(renewalRequests);
  } catch (error) {
    console.error("Error fetching renewal requests:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
