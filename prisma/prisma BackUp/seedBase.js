import { PrismaClient, Role, SignUp } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // ล้างข้อมูลเก่า
    await prisma.domain.deleteMany();
    await prisma.domainRequest.deleteMany();
    await prisma.deletedDomainLog.deleteMany();
    await prisma.position.deleteMany();
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
    await prisma.user.create({
        data: {
            username: signUpAdmin.username,
            password: signUpAdmin.password,
            role: Role.ADMIN,
            positionId: adminPosition.id,
            signUpUserId: signUpAdmin.id
        }
    });
    await prisma.user.create({
        data: {
            username: signUpUser01.username,
            password: signUpUser01.password,
            role: Role.USER,
            positionId: userPosition.id,
            signUpUserId: signUpUser01.id
        }
    });
    await prisma.user.create({
        data: {
            username: signUpUser02.username,
            password: signUpUser02.password,
            role: Role.USER,
            positionId: userPosition.id,
            signUpUserId: signUpUser02.id
        }
    });

    console.log('✅ Seed สำเร็จ! มีแค่ SignUpUser + User + Position');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Error seeding data:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
