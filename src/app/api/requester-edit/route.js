import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...fields } = body;

        if (!id) {
            return NextResponse.json({ error: 'ไม่พบ id ของโดเมน' }, { status: 400 });
        }

        // ลบ field ที่ undefined หรือ null ออก
        const updateData = Object.fromEntries(
            Object.entries(fields).filter(([_, value]) => value !== undefined && value !== null)
        );

        // ถ้ามี domain ให้ lowercase
        if (updateData.domain) updateData.domain = updateData.domain.toLowerCase();

        const updatedDomain = await prisma.domainRequest.update({
            where: { id: id },
            data: updateData,
        });

        return NextResponse.json(updatedDomain, { status: 200 });
    } catch (error) {
        console.error('Error updating domain:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
