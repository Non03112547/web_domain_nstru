import { PrismaClient, Role, DurationType, RequestStatus, DomainStatus, Purpose } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 🧹 ล้างข้อมูลเก่า
    await prisma.renewalRequest.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.domainRequest.deleteMany();
    await prisma.deletedDomainLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.position.deleteMany();

    // 🧑‍💼 เพิ่มตำแหน่ง
    const adminPosition = await prisma.position.create({
        data: { name: 'ผู้ดูแลระบบ', description: 'มีสิทธิ์จัดการทุกอย่าง' }
    });

    const userPosition = await prisma.position.create({
        data: { name: 'เจ้าหน้าที่ทั่วไป', description: 'สามารถส่งคำขอใช้โดเมน' }
    });

    // 👤 เพิ่มผู้ใช้ พร้อม hash password
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: Role.ADMIN,
            positionId: adminPosition.id,
        }
    });

    const user01 = await prisma.user.create({
        data: {
            username: 'user01',
            password: await bcrypt.hash('passuser01', 10),
            role: Role.USER,
            positionId: userPosition.id,
        }
    });

    const user02 = await prisma.user.create({
        data: {
            username: 'user02',
            password: await bcrypt.hash('passuser02', 10),
            role: Role.USER,
            positionId: userPosition.id,
        }
    });

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
            position: 'เจ้าหน้าที่',
            department: 'ห้องสมุดกลาง',
            institution: 'NSTRU',
            contactP: '0811111111',
            contactE: 'somchai@nstru.ac.th',
            responsibleContactP: '0822222222',
            responsibleContactE: 'somk@nstru.ac.th',
            machineAdminType: 'requester',
            machineAdminName: 'นายสมชาย ใจดี',
            machineAdminPosition: 'เจ้าหน้าที่',
            machineAdminContactP: '0833333333',
            machineAdminContactE: 'somchai@nstru.ac.th',
            machineRoom: 'ห้อง 101',
            machinePlace: 'อาคารห้องสมุด',
            property: Purpose.InNSTRU,
            useType: Purpose.Sever,
            purpose: 'ให้บริการภายในมหาวิทยาลัย',
            durationType: DurationType.PERMANENT,
            status: RequestStatus.APPROVED,
            userId: user01.id
        }
    });

    const approvedDomain = await prisma.domain.create({
        data: {
            domainRequestId: approvedRequest.id,
            lastUsedAt: new Date(),
            status: DomainStatus.ACTIVE,
            decideTime: new Date() // อนุมัติ → set decideTime
        }
    });

    // 🕒 คำขอโดเมน EXPIRED
    const expiredRequest = await prisma.domainRequest.create({
        data: {
            domain: 'expired.nstru.ac.th',
            ipAddress: '192.168.0.20',
            machineType: 'PC',
            OS: 'Windows',
            requesterName: 'นางสาวลืมต่อ',
            responsibleName: 'นายลืมต่อ',
            position: 'เจ้าหน้าที่',
            department: 'ฝ่ายไอที',
            institution: 'NSTRU',
            contactP: '0844444444',
            contactE: 'expire@nstru.ac.th',
            responsibleContactP: '0855555555',
            responsibleContactE: 'resp@nstru.ac.th',
            machineAdminType: 'other',
            machineAdminName: 'นายช่วยดูแล',
            machineAdminPosition: 'จนท.',
            machineAdminContactP: '0866666666',
            machineAdminContactE: 'support@nstru.ac.th',
            machineRoom: 'ห้อง 202',
            machinePlace: 'อาคารบริการ',
            property: Purpose.InOutNSTRU,
            useType: Purpose.NoSever,
            purpose: 'ใช้จัดเก็บข้อมูลภายใน',
            durationType: DurationType.TEMPORARY,
            expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: RequestStatus.APPROVED,
            userId: user02.id
        }
    });

    const expiredDomain = await prisma.domain.create({
        data: {
            domainRequestId: expiredRequest.id,
            lastUsedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            status: DomainStatus.EXPIRED,
            // expired → ยังไม่ set decideTime
        }
    });

    // 🔄 Renewal Request (PENDING)
    await prisma.renewalRequest.create({
        data: {
            domainId: expiredDomain.id,
            newExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            reason: 'จำเป็นต้องใช้งานต่อ',
            status: RequestStatus.PENDING,
            userId: user02.id
        }
    });

    // 🗑️ โดเมนในถังขยะ
    const trashedRequest = await prisma.domainRequest.create({
        data: {
            domain: 'old.nstru.ac.th',
            ipAddress: '192.168.0.30',
            requesterName: 'นายเก่า',
            responsibleName: 'นายเก่า',
            position: 'เจ้าหน้าที่',
            department: 'เก่า',
            institution: 'NSTRU',
            contactP: '0877777777',
            contactE: 'old@nstru.ac.th',
            responsibleContactP: '0888888888',
            responsibleContactE: 'oldr@nstru.ac.th',
            machineAdminType: 'requester',
            machineAdminName: 'นายเก่า',
            machineAdminPosition: 'เจ้าหน้าที่',
            machineAdminContactP: '0899999999',
            machineAdminContactE: 'old@nstru.ac.th',
            durationType: DurationType.TEMPORARY,
            expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: RequestStatus.APPROVED,
            userId: user01.id
        }
    });

    await prisma.domain.create({
        data: {
            domainRequestId: trashedRequest.id,
            deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            trashExpiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
            lastUsedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            status: DomainStatus.TRASHED,
            // trashed → ยังไม่ set decideTime
        }
    });

    // 🧹 ล็อกการลบโดเมน
    await prisma.deletedDomainLog.create({
        data: {
            domainName: 'archive.nstru.ac.th',
            reason: 'ไม่ใช้งานแล้ว ลบทิ้ง',
        }
    });

    console.log('✅ Database seeded successfully with decideTime only for APPROVED/REJECTED!');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Error seeding data:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
