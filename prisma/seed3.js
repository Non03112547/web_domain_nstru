import { PrismaClient, Role, DurationType, RequestStatus, DomainStatus, Purpose } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // ล้างข้อมูลเก่า
    await prisma.renewalRequest.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.domainRequest.deleteMany();
    await prisma.deletedDomainLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.position.deleteMany();

    // สร้างตำแหน่ง
    const adminPosition = await prisma.position.create({
        data: { name: 'ผู้ดูแลระบบ', description: 'มีสิทธิ์จัดการทุกอย่าง' }
    });

    const userPosition = await prisma.position.create({
        data: { name: 'เจ้าหน้าที่ทั่วไป', description: 'สามารถส่งคำขอใช้โดเมน' }
    });

    // สร้างผู้ใช้
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

    const users = [user01, user02];

    // สร้างโดเมนตัวอย่างเท่าที่ไหว
    const totalDomains = 50; // กำหนดจำนวน record เท่าที่ไหว
    for (let i = 1; i <= totalDomains; i++) {
        const user = users[i % users.length]; // สลับ user
        let domainRequestData, domainData;

        if (i % 3 === 1) {
            // APPROVED ACTIVE
            domainRequestData = {
                domain: `active${i}.nstru.ac.th`,
                ipAddress: `192.168.1.${i}`,
                machineType: 'Server',
                OS: 'Linux',
                requesterName: `Requester ${i}`,
                responsibleName: `Responsible ${i}`,
                position: 'เจ้าหน้าที่',
                department: 'ฝ่าย IT',
                institution: 'NSTRU',
                contactP: `08100000${i.toString().padStart(2, '0')}`,
                contactE: `user${i}@nstru.ac.th`,
                responsibleContactP: `08200000${i.toString().padStart(2, '0')}`,
                responsibleContactE: `resp${i}@nstru.ac.th`,
                machineAdminType: 'requester',
                machineAdminName: `Admin ${i}`,
                machineAdminPosition: 'เจ้าหน้าที่',
                machineAdminContactP: `08300000${i.toString().padStart(2, '0')}`,
                machineAdminContactE: `admin${i}@nstru.ac.th`,
                machineRoom: `ห้อง ${100 + i}`,
                machinePlace: `อาคาร ${i}`,
                property: Purpose.InNSTRU,
                useType: Purpose.Sever,
                purpose: 'ให้บริการภายในมหาวิทยาลัย',
                durationType: DurationType.PERMANENT,
                status: RequestStatus.APPROVED,
                userId: user.id
            };

            domainData = {
                lastUsedAt: new Date(),
                status: DomainStatus.ACTIVE,
                decideTime: new Date()
            };

        } else if (i % 3 === 2) {
            // EXPIRED + RenewalRequest
            domainRequestData = {
                domain: `expired${i}.nstru.ac.th`,
                ipAddress: `192.168.2.${i}`,
                machineType: 'PC',
                OS: 'Windows',
                requesterName: `Requester ${i}`,
                responsibleName: `Responsible ${i}`,
                position: 'เจ้าหน้าที่',
                department: 'ฝ่าย IT',
                institution: 'NSTRU',
                contactP: `08400000${i.toString().padStart(2, '0')}`,
                contactE: `user${i}@nstru.ac.th`,
                responsibleContactP: `08500000${i.toString().padStart(2, '0')}`,
                responsibleContactE: `resp${i}@nstru.ac.th`,
                machineAdminType: 'other',
                machineAdminName: `Admin ${i}`,
                machineAdminPosition: 'เจ้าหน้าที่',
                machineAdminContactP: `08600000${i.toString().padStart(2, '0')}`,
                machineAdminContactE: `admin${i}@nstru.ac.th`,
                machineRoom: `ห้อง ${200 + i}`,
                machinePlace: `อาคาร ${i}`,
                property: Purpose.InOutNSTRU,
                useType: Purpose.NoSever,
                purpose: 'ใช้จัดเก็บข้อมูลภายใน',
                durationType: DurationType.TEMPORARY,
                expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: RequestStatus.APPROVED,
                userId: user.id
            };

            domainData = {
                lastUsedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                status: DomainStatus.EXPIRED
            };

        } else {
            // TRASHED + DeletedDomainLog
            domainRequestData = {
                domain: `trashed${i}.nstru.ac.th`,
                ipAddress: `192.168.3.${i}`,
                requesterName: `Requester ${i}`,
                responsibleName: `Responsible ${i}`,
                position: 'เจ้าหน้าที่',
                department: 'ฝ่าย IT',
                institution: 'NSTRU',
                contactP: `08700000${i.toString().padStart(2, '0')}`,
                contactE: `user${i}@nstru.ac.th`,
                responsibleContactP: `08800000${i.toString().padStart(2, '0')}`,
                responsibleContactE: `resp${i}@nstru.ac.th`,
                machineAdminType: 'requester',
                machineAdminName: `Admin ${i}`,
                machineAdminPosition: 'เจ้าหน้าที่',
                machineAdminContactP: `08900000${i.toString().padStart(2, '0')}`,
                machineAdminContactE: `admin${i}@nstru.ac.th`,
                durationType: DurationType.TEMPORARY,
                expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                status: RequestStatus.APPROVED,
                userId: user.id
            };

            domainData = {
                lastUsedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                trashExpiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
                status: DomainStatus.TRASHED
            };
        }

        const domainRequest = await prisma.domainRequest.create({ data: domainRequestData });
        const domain = await prisma.domain.create({ data: { ...domainData, domainRequestId: domainRequest.id } });

        // ถ้า EXPIRED ให้สร้าง RenewalRequest
        if (i % 3 === 2) {
            await prisma.renewalRequest.create({
                data: {
                    domainId: domain.id,
                    newExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    reason: 'จำเป็นต้องใช้งานต่อ',
                    status: RequestStatus.PENDING,
                    userId: user.id
                }
            });
        }

        // ถ้า TRASHED ให้สร้าง DeletedDomainLog
        if (i % 3 === 0) {
            await prisma.deletedDomainLog.create({
                data: {
                    domainName: domainRequest.domain,
                    reason: 'ไม่ใช้งานแล้ว ลบทิ้ง'
                }
            });
        }
    }

    console.log('✅ Database seeded successfully without faker, generated manually!');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Error seeding data:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
