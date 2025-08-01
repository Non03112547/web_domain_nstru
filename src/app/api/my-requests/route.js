import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin can see all requests, regular users can only see their own
        const whereClause = session.user.role === 'ADMIN' ? {} : { userId: session.user.id }

        const requests = await prisma.domainRequest.findMany({
            where: whereClause,
            include: {
                domain_record: true,
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                requestedAt: 'desc'
            }
        })

        return NextResponse.json(requests)
    } catch (error) {
        console.error('Error fetching user requests:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
