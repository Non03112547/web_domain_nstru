import prisma from '@/lib/db'

export async function GET() {
    try {
        await prisma.$connect()
        console.log('✅ Connected to the database')
        return new Response('Database connected!', { status: 200 })
    } catch (error) {
        console.error('❌ Database connection error:', error)
        return new Response('Database connection failed', { status: 500 })
    }
}
