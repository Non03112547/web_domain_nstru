import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ล้างข้อมูลเก่าก่อน
    await prisma.renewalRequest.deleteMany()
    await prisma.domain.deleteMany()
    await prisma.domainRequest.deleteMany()
    await prisma.user.deleteMany()
    await prisma.position.deleteMany()
    await prisma.deletedDomainLog.deleteMany()

    // 🧑‍💼 เพิ่มตำแหน่ง
    const adminPosition = await prisma.position.create({
        data: {
            name: 'ผู้ดูแลระบบ',
            description: 'มีสิทธิ์จัดการทุกอย่าง',
        }
    })

    const userPosition = await prisma.position.create({
        data: {
            name: 'เจ้าหน้าที่ทั่วไป',
            description: 'สามารถส่งคำขอใช้โดเมน',
        }
    })

    // 👤 เพิ่มผู้ใช้
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: 'admin123',
            role: 'ADMIN',
            positionId: adminPosition.id,
        }
    })

    const user01 = await prisma.user.create({
        data: {
            username: 'user01',
            password: 'passuser01',
            role: 'USER',
            positionId: userPosition.id,
        }
    })

    const user02 = await prisma.user.create({
        data: {
            username: 'user02',
            password: 'passuser02',
            role: 'USER',
            positionId: userPosition.id,
        }
    })

    // 🌐 คำขอโดเมน APPROVED
    const approvedRequest = await prisma.domainRequest.create({
        data: {
            domain: 'library.nstru.ac.th',
            ipAddress: '192.168.0.10',
            machineType: 'Server',
            OS: 'Linux',
            otherMachineType: 'NO',
            otherOS: 'NO',
            requesterName: 'นายสมชาย ใจดี',
            responsibleName: 'นายสมศักดิ์ รักษาดี',
            department: 'ห้องสมุดกลาง',
            institution: 'NSTRU',
            contact: 'somchai@nstru.ac.th',
            contactType: 'EMAIL',
            responsibleContact: 'somk@nstru.ac.th',
            responsibleContactType: 'EMAIL',
            machineAdminType: 'requester',
            machineAdminName: 'นายสมชาย ใจดี',
            machineAdminPosition: 'เจ้าหน้าที่',
            machineAdminContact: 'somchai@nstru.ac.th',
            machineAdminContactType: 'EMAIL',
            machineRoom: 'ห้อง 101',
            machinePlace: 'อาคารห้องสมุด',
            property: 'InNSTRU',
            useType: 'Sever',
            purpose: 'ให้บริการภายในมหาวิทยาลัย',
            durationType: 'PERMANENT',
            status: 'APPROVED',
            userId: user01.id
        }
    })

    await prisma.domain.create({
        data: {
            domainRequestId: approvedRequest.id,
            lastUsedAt: new Date(),
            status: 'ACTIVE',
        }
    })

    // 🕒 คำขอโดเมน EXPIRED
    const expiredRequest = await prisma.domainRequest.create({
        data: {
            domain: 'expired.nstru.ac.th',
            ipAddress: '192.168.0.20',
            machineType: 'PC',
            OS: 'Windows',
            requesterName: 'นางสาวลืมต่อ',
            responsibleName: 'นายลืมต่อ',
            department: 'ฝ่ายไอที',
            institution: 'NSTRU',
            contact: 'expire@nstru.ac.th',
            contactType: 'EMAIL',
            responsibleContact: 'resp@nstru.ac.th',
            responsibleContactType: 'EMAIL',
            machineAdminType: 'other',
            machineAdminName: 'นายช่วยดูแล',
            machineAdminPosition: 'จนท.',
            machineAdminContact: 'support@nstru.ac.th',
            machineAdminContactType: 'EMAIL',
            machineRoom: 'ห้อง 202',
            machinePlace: 'อาคารบริการ',
            property: 'InOutNSTRU',
            useType: 'NoSever',
            purpose: 'ใช้จัดเก็บข้อมูลภายใน',
            durationType: 'TEMPORARY',
            expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'APPROVED',
            userId: user02.id
        }
    })

    const expiredDomain = await prisma.domain.create({
        data: {
            domainRequestId: expiredRequest.id,
            lastUsedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            status: 'EXPIRED',
        }
    })

    // 🔄 Renewal Requests — แก้ไข: มีแค่ 1 คำขอที่เป็น PENDING หรือ APPROVED เท่านั้น
    // เอาเฉพาะคำขอ PENDING อันเดียวไว้ (หรือจะเลือกอัน APPROVED ก็ได้)
    await prisma.renewalRequest.create({
        data: {
            domainId: expiredDomain.id,
            newExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            reason: 'จำเป็นต้องใช้งานต่อ',
            status: 'PENDING',
            userId: user02.id
        }
    })

    // คำขอ APPROVED กับ REJECTED เอาออก (ถ้าต้องการแค่ 1 request ที่ยังไม่ปฏิเสธ)

    // 🗑️ โดเมนในถังขยะ
    const trashedRequest = await prisma.domainRequest.create({
        data: {
            domain: 'old.nstru.ac.th',
            ipAddress: '192.168.0.30',
            requesterName: 'นายเก่า',
            responsibleName: 'นายเก่า',
            department: 'เก่า',
            institution: 'NSTRU',
            contact: 'old@nstru.ac.th',
            contactType: 'EMAIL',
            responsibleContact: 'oldr@nstru.ac.th',
            responsibleContactType: 'EMAIL',
            machineAdminType: 'requester',
            machineAdminName: 'นายเก่า',
            machineAdminPosition: 'เจ้าหน้าที่',
            machineAdminContact: 'old@nstru.ac.th',
            machineAdminContactType: 'EMAIL',
            durationType: 'TEMPORARY',
            expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'APPROVED',
            userId: user01.id
        }
    })

    await prisma.domain.create({
        data: {
            domainRequestId: trashedRequest.id,
            deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            trashExpiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
            lastUsedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            status: 'TRASHED',
        }
    })

    // 🧹 ล็อกการลบโดเมน
    await prisma.deletedDomainLog.create({
        data: {
            domainName: 'archive.nstru.ac.th',
            reason: 'ไม่ใช้งานแล้ว ลบทิ้ง',
        }
    })

    console.log('✅ Database seeded successfully with full schema!')
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Error seeding data:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
