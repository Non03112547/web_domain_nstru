import { PrismaClient, Role, DurationType, RequestStatus, DomainStatus, Purpose, SignUp } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // ล้างข้อมูลเก่า
    await prisma.domain.deleteMany();
    await prisma.domainRequest.deleteMany();
    await prisma.deletedDomainLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.signUpUser.deleteMany();
    await prisma.position.deleteMany();

    // สร้างตำแหน่ง
    const adminPosition = await prisma.position.create({
        data: { name: 'ผู้ดูแลระบบ', description: 'มีสิทธิ์จัดการทุกอย่าง' }
    });
    const userPosition = await prisma.position.create({
        data: { name: 'เจ้าหน้าที่ทั่วไป', description: 'สามารถส่งคำขอใช้โดเมน' }
    });

    // สร้าง SignUpUser
    const signUpAdmin = await prisma.signUpUser.create({
        data: {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            contactP: '0811111111',
            contactE: 'admin@nstru.ac.th',
            role: Role.ADMIN,
            status: SignUp.APPROVED
        }
    });
    const signUpUser01 = await prisma.signUpUser.create({
        data: {
            username: 'user01',
            password: await bcrypt.hash('passuser01', 10),
            contactP: '0822222222',
            contactE: 'user01@nstru.ac.th',
            role: Role.USER,
            status: SignUp.APPROVED
        }
    });
    const signUpUser02 = await prisma.signUpUser.create({
        data: {
            username: 'user02',
            password: await bcrypt.hash('passuser02', 10),
            contactP: '0833333333',
            contactE: 'user02@nstru.ac.th',
            role: Role.USER,
            status: SignUp.APPROVED
        }
    });

    // สร้าง Users จาก SignUpUser
    const admin = await prisma.user.create({
        data: {
            username: signUpAdmin.username,
            password: signUpAdmin.password,
            role: Role.ADMIN,
            positionId: adminPosition.id,
            signUpUserId: signUpAdmin.id
        }
    });
    const user01 = await prisma.user.create({
        data: {
            username: signUpUser01.username,
            password: signUpUser01.password,
            role: Role.USER,
            positionId: userPosition.id,
            signUpUserId: signUpUser01.id
        }
    });
    const user02 = await prisma.user.create({
        data: {
            username: signUpUser02.username,
            password: signUpUser02.password,
            role: Role.USER,
            positionId: userPosition.id,
            signUpUserId: signUpUser02.id
        }
    });

    // ข้อมูล domains 20 ตัว
    const domainDataList = [
        // 5 ACTIVE
        { domain: 'library.nstru.ac.th', ip: '192.168.0.101', type: 'ACTIVE', duration: DurationType.PERMANENT, user: user01, requester: 'นายสมชาย ใจดี', responsible: 'นายสมศักดิ์ รักษาดี' },
        { domain: 'research.nstru.ac.th', ip: '192.168.0.102', type: 'ACTIVE', duration: DurationType.PERMANENT, user: user01, requester: 'นางสาววิจัย ดีดี', responsible: 'นายสมคิด มีสุข' },
        { domain: 'finance.nstru.ac.th', ip: '192.168.0.103', type: 'ACTIVE', duration: DurationType.PERMANENT, user: user02, requester: 'นายการเงิน', responsible: 'นางสาวบัญชี' },
        { domain: 'hr.nstru.ac.th', ip: '192.168.0.104', type: 'ACTIVE', duration: DurationType.PERMANENT, user: user02, requester: 'นางสาวบุคคล', responsible: 'นายฝ่ายบุคคล' },
        { domain: 'admin.nstru.ac.th', ip: '192.168.0.105', type: 'ACTIVE', duration: DurationType.PERMANENT, user: admin, requester: 'admin', responsible: 'admin' },

        // 4 EXPIRED
        { domain: 'expired.nstru.ac.th', ip: '192.168.0.201', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user02, requester: 'นางสาวลืมต่อ', responsible: 'นายลืมต่อ' },
        { domain: 'oldserver.nstru.ac.th', ip: '192.168.0.202', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user01, requester: 'นายเก่า', responsible: 'นางสาวเก่า' },
        { domain: 'labexpired.nstru.ac.th', ip: '192.168.0.203', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user01, requester: 'นางสาวทดลอง', responsible: 'นายทดลอง' },
        { domain: 'testexpired.nstru.ac.th', ip: '192.168.0.204', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user02, requester: 'นายทดสอบ', responsible: 'นางสาวทดสอบ' },

        // 3 EXPIRED_NO_RENEW
        { domain: 'expired2.nstru.ac.th', ip: '192.168.0.205', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user02, requester: 'นายหมดอายุ', responsible: 'นางหมดอายุ' },
        { domain: 'expired3.nstru.ac.th', ip: '192.168.0.206', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user01, requester: 'นางสาวหมดอายุ', responsible: 'นายหมดอายุ' },
        { domain: 'expired4.nstru.ac.th', ip: '192.168.0.207', type: 'EXPIRED', duration: DurationType.TEMPORARY, user: user02, requester: 'นายไม่ได้ต่อ', responsible: 'นางไม่ได้ต่อ' },

        // 4 TRASHED
        { domain: 'old.nstru.ac.th', ip: '192.168.0.208', type: 'TRASHED', duration: DurationType.TEMPORARY, user: user01, requester: 'นายเก่า', responsible: 'นายเก่า' },
        { domain: 'archive.nstru.ac.th', ip: '192.168.0.209', type: 'TRASHED', duration: DurationType.TEMPORARY, user: user01, requester: 'นายเก็บ', responsible: 'นางสาวเก็บ' },
        { domain: 'trash1.nstru.ac.th', ip: '192.168.0.210', type: 'TRASHED', duration: DurationType.TEMPORARY, user: user02, requester: 'นายลบ1', responsible: 'นางลบ1' },
        { domain: 'trash2.nstru.ac.th', ip: '192.168.0.211', type: 'TRASHED', duration: DurationType.TEMPORARY, user: user02, requester: 'นายลบ2', responsible: 'นางลบ2' },

        // 4 PENDING
        { domain: 'newrequest1.nstru.ac.th', ip: '192.168.0.212', type: 'PENDING', duration: DurationType.TEMPORARY, user: user02, requester: 'นางสาวรออนุมัติ', responsible: 'นายรออนุมัติ' },
        { domain: 'newrequest2.nstru.ac.th', ip: '192.168.0.213', type: 'PENDING', duration: DurationType.TEMPORARY, user: user01, requester: 'นายขอใหม่', responsible: 'นางสาวขอใหม่' },
        { domain: 'newrequest3.nstru.ac.th', ip: '192.168.0.214', type: 'PENDING', duration: DurationType.TEMPORARY, user: user01, requester: 'นางรอ', responsible: 'นายรอ' },
        { domain: 'newrequest4.nstru.ac.th', ip: '192.168.0.215', type: 'PENDING', duration: DurationType.TEMPORARY, user: user02, requester: 'นายรอ', responsible: 'นางรอ' }
    ];

    for (const entry of domainDataList) {
        const domainRequest = await prisma.domainRequest.create({
            data: {
                domain: entry.domain,
                ipAddress: entry.ip,
                machineType: 'PC',
                OS: 'Windows',
                requesterName: entry.requester,
                responsibleName: entry.responsible,
                position: 'เจ้าหน้าที่',
                department: 'ฝ่าย IT',
                institution: 'NSTRU',
                contactP: '0812345678',
                contactE: `${entry.user.username}@nstru.ac.th`,
                responsibleContactP: '0823456789',
                responsibleContactE: `${entry.user.username}resp@nstru.ac.th`,
                machineAdminType: 'requester',
                machineAdminName: entry.requester,
                machineAdminPosition: 'เจ้าหน้าที่',
                machineAdminContactP: '0834567890',
                machineAdminContactE: `${entry.user.username}admin@nstru.ac.th`,
                property: Purpose.InNSTRU,
                useType: Purpose.NoSever,
                purpose: 'ใช้จัดเก็บข้อมูลภายในมหาวิทยาลัย',
                durationType: entry.duration,
                expiresAt: entry.duration === DurationType.TEMPORARY ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                status: entry.type === 'PENDING' ? RequestStatus.PENDING : RequestStatus.APPROVED,
                userId: entry.user.id
            }
        });

        await prisma.domain.create({
            data: {
                domainRequestId: domainRequest.id,
                lastUsedAt: new Date(),
                status: entry.type === 'ACTIVE' ? DomainStatus.ACTIVE :
                    entry.type.startsWith('EXPIRED') ? DomainStatus.EXPIRED :
                        entry.type === 'TRASHED' ? DomainStatus.TRASHED :
                            DomainStatus.ACTIVE,
                decideTime: entry.type === 'ACTIVE' || entry.type.startsWith('EXPIRED') ? new Date() : null,
                deletedAt: entry.type === 'TRASHED' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
                trashExpiresAt: entry.type === 'TRASHED' ? new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) : null
            }
        });
    }

    console.log('✅ Seed สำเร็จครบทุก SignUpUser, User, DomainRequest, Domain!');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Error seeding data:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
