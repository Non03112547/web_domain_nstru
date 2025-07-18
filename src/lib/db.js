import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// เพิ่ม fallback ถ้า global ไม่มี prisma
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient()

const prisma = globalForPrisma.prisma

export default prisma
