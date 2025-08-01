import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
    try {
        // ไม่ต้อง check session สำหรับหน้าแรก - ให้ทุกคนดูได้
        const domains = await prisma.domain.findMany({
            include: {
                domainRequest: {
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                },

            },
            orderBy: {
                domainRequest: {
                    requestedAt: 'desc'
                }
            }
        })

        return NextResponse.json(domains)
    } catch (error) {
        console.error('Error fetching domains:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}