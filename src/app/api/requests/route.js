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

        const requests = await prisma.domainRequest.findMany({
            include: {
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
        console.error('Error fetching requests:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            domain,
            purpose,
            ipAddress,
            requesterName,
            responsibleName,
            department,
            contactP,
            contactE,
            durationType,
            expiresAt,
            machineType,
            OS,
            otherMachineType,
            otherOS,
            institution,
            responsibleContactP,
            responsibleContactE,
            machineAdminType,
            machineAdminName,
            machineAdminPosition,
            machineAdminContactP,
            machineAdminContactE,
            machineRoom,
            machinePlace,
            property,
            useType
        } = body

        // Validate required fields
        if (!domain || !machineType || !OS || !requesterName || !responsibleName || !department || !institution || !contactP || !contactE || !responsibleContactP || !responsibleContactE || !machineRoom || !machinePlace || !property || !useType) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
        }

        // Check if domain already exists
        const existingDomain = await prisma.domainRequest.findFirst({
            where: {
                domain: domain.toLowerCase()
            }
        })

        if (existingDomain) {
            return NextResponse.json({ error: 'โดเมนนี้ถูกขอใช้งานแล้ว' }, { status: 400 })
        }

        // Check if IP address already exists
        const existingIP = await prisma.domainRequest.findFirst({
            where: {
                ipAddress: ipAddress
            }
        })

        if (existingIP) {
            return NextResponse.json({ error: 'IP Address นี้ถูกใช้งานโดยโดเมนอื่นแล้ว' }, { status: 400 })
        }

        const requestData = {
            domain: domain.toLowerCase(),
            purpose,
            ipAddress,
            requesterName,
            responsibleName,
            department,
            contactP,
            contactE,
            durationType, machineType,
            OS,
            otherMachineType,
            otherOS,
            institution,
            responsibleContactP,
            responsibleContactE,
            machineAdminType,
            machineAdminName,
            machineAdminPosition,
            machineAdminContactP,
            machineAdminContactE,
            machineRoom,
            machinePlace,
            property,
            useType,
            expiresAt,
            userId: session.user.id
        }

        // Handle expiry date for temporary domains
        if (durationType === 'TEMPORARY') {
            if (!expiresAt) {
                return NextResponse.json({ error: 'กรุณาระบุวันหมดอายุสำหรับโดเมนชั่วคราว' }, { status: 400 })
            }
            requestData.expiresAt = new Date(expiresAt)
        }

        const newRequest = await prisma.domainRequest.create({
            data: requestData,
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        })

        return NextResponse.json(newRequest, { status: 201 })
    } catch (error) {
        console.error('Error creating request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
