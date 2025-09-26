import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// เพิ่ม fallback ถ้า global ไม่มี prisma
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient()

const prisma = globalForPrisma.prisma

if (process.env.NODE_ENV === 'development') {
    (async () => {
        try {
            await prisma.$connect()
            console.log('✅ Database connected successfully (dev mode)')
        } catch (err) {
            console.error('❌ Database connection error (dev mode):', err)
        }
    })()
}


export default prisma
