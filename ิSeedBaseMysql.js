import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { cuid } from 'cuid';

// สร้าง connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'dev_db',
});

// ฟังก์ชัน seed
async function main() {
    const connection = await pool.getConnection();

    try {
        // ล้างข้อมูลเก่า
        await connection.query('DELETE FROM domains');
        await connection.query('DELETE FROM domain_requests');
        await connection.query('DELETE FROM deleted_domain_logs');
        await connection.query('DELETE FROM users');
        await connection.query('DELETE FROM signupusers');
        await connection.query('DELETE FROM positions');

        // สร้างตำแหน่ง
        const adminPositionId = cuid();
        const userPositionId = cuid();

        await connection.query(
            'INSERT INTO positions (id, name, description) VALUES (?, ?, ?)',
            [adminPositionId, 'ผู้ดูแลระบบ', 'มีสิทธิ์จัดการทุกอย่าง']
        );
        await connection.query(
            'INSERT INTO positions (id, name, description) VALUES (?, ?, ?)',
            [userPositionId, 'เจ้าหน้าที่ทั่วไป', 'สามารถส่งคำขอใช้โดเมน']
        );

        // สร้าง SignUpUser
        const signUpUsers = [
            {
                id: cuid(),
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                contactP: '0811111111',
                contactE: 'admin@nstru.ac.th',
                role: 'ADMIN',
                status: 'APPROVED',
            },
            {
                id: cuid(),
                username: 'user01',
                password: await bcrypt.hash('passuser01', 10),
                contactP: '0822222222',
                contactE: 'user01@nstru.ac.th',
                role: 'USER',
                status: 'APPROVED',
            },
            {
                id: cuid(),
                username: 'user02',
                password: await bcrypt.hash('passuser02', 10),
                contactP: '0833333333',
                contactE: 'user02@nstru.ac.th',
                role: 'USER',
                status: 'APPROVED',
            },
        ];

        for (const user of signUpUsers) {
            await connection.query(
                `INSERT INTO signupusers (id, username, password, contactP, contactE, role, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.username, user.password, user.contactP, user.contactE, user.role, user.status]
            );

            // สร้าง User
            const positionId = user.role === 'ADMIN' ? adminPositionId : userPositionId;
            await connection.query(
                `INSERT INTO users (id, username, password, role, positionId, signUpUserId) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [cuid(), user.username, user.password, user.role, positionId, user.id]
            );
        }

        console.log('✅ Seed สำเร็จ! มี SignUpUser + User + Position');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        connection.release();
        pool.end();
    }
}

main();
