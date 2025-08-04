import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session.user.role === 'ADMIN'

        const whereClause = isAdmin
            ? undefined
            : {
                domainRequest: {
                    some: {
                        userId: session.user.id,
                    },
                },
            }

        const domains = await prisma.domain.findMany({
            where: whereClause,
            include: {
                domainRequest: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json(domains)
    } catch (error) {
        console.error('Error fetching domains:', error)
    }
}
