import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Prevent deleting self
        if (user.id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Delete user and related data in a transaction
        await prisma.$transaction([
            // Delete domains associated with user's requests
            prisma.domain.deleteMany({
                where: {
                    domainRequest: {
                        userId: userId
                    }
                }
            }),
            // Delete user's domain requests
            prisma.domainRequest.deleteMany({
                where: {
                    userId: userId
                }
            }),
            // Delete user
            prisma.user.delete({
                where: { id: userId }
            })
        ])

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
