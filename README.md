# คู่มือการติดตั้งและใช้งานระบบจัดการโดเมน NSTRU

## ภาพรวมของระบบ
ระบบจัดการโดเมนสำหรับมหาวิทยาลัยราชภัฏนครศรีธรรมราช เป็นเว็บแอปพลิเคชันที่พัฒนาด้วย **Next.js 15** และ **Prisma ORM** สำหรับจัดการฐานข้อมูล MySQL

### คุณสมบัติหลัก
- 🔐 ระบบลงทะเบียนและเข้าสู่ระบบ
- 📝 ระบบส่งคำขอใช้โดเมน
- ✅ ระบบอนุมัติ/ปฏิเสธคำขอ (สำหรับผู้ดูแล)
- 📊 ระบบติดตามสถานะโดเมน
- 📄 สร้างเอกสาร Word/PDF อัตโนมัติ
- ⏰ ระบบตรวจสอบสถานะโดเมนอัตโนมัติ
- 🗂️ จัดการข้อมูลผู้ใช้และตำแหน่งงาน

## ข้อกำหนดระบบ

### ซอฟต์แวร์ที่จำเป็น
- **Node.js** เวอร์ชัน 18.0 หรือใหม่กว่า
- **MySQL** เวอร์ชัน 8.0 หรือใหม่กว่า
- **npm** หรือ **yarn** สำหรับจัดการแพ็คเกจ
- **Git** (ถ้าต้องการ clone จาก repository)

### ข้อกำหนดเซิร์ฟเวอร์
- RAM: 2GB ขึ้นไป
- HDD: 5GB ว่าง
- Internet connection (สำหรับตรวจสอบสถานะโดเมน)

## การติดตั้ง

### ขั้นตอนที่ 1: เตรียมฐานข้อมูล MySQL

#### สร้างฐานข้อมูล
```sql
CREATE DATABASE dev_db;
CREATE USER 'web_domain_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON dev_db.* TO 'web_domain_user'@'localhost';
FLUSH PRIVILEGES;
```

#### หรือใช้ไฟล์ SQL ที่มีให้
```bash
mysql -u root -p < dev_db.sql
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
# เข้าไปในโฟลเดอร์โปรเจค
cd "D:\fire\jampan\The_Jober\test_job\DOfix\web_domain - Copy"

# ติดตั้ง dependencies
npm install
```

### ขั้นตอนที่ 3: ตั้งค่าตัวแปรสภาพแวดล้อม

#### สำหรับ MySQL (แนะนำ)
สร้างไฟล์ `.env.local` โดยคัดลอกจาก `.env.example-mysql`:

```bash
# สำหรับ Windows
copy ".env.example-mysql" ".env.local"

# สำหรับ Mac/Linux  
cp .env.example-mysql .env.local
```

แก้ไขไฟล์ `.env.local`:
```bash
# Database
DATABASE_URL="mysql://web_domain_user:your_secure_password@localhost:3306/dev_db"

# NextAuth Secret (สร้าง secret ใหม่)
NEXTAUTH_SECRET="your-very-long-random-string-here"

# URL ของแอปพลิเคชัน
NEXTAUTH_URL="http://localhost:3000"
```

#### สำหรับ SQLite (สำหรับทดสอบ)
```bash
# Database
DATABASE_URL="file:./youData.db"

# NextAuth Secret
NEXTAUTH_SECRET="your-very-long-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

### ขั้นตอนที่ 4: ตั้งค่าฐานข้อมูล

```bash
# สร้างตารางฐานข้อมูล
npx prisma generate
npx prisma db push

# เพิ่มข้อมูลเริ่มต้น (ผู้ดูแลระบบและตำแหน่งงาน)
npm run seedBase
```

### ขั้นตอนที่ 5: รันแอปพลิเคชัน

#### รันในโหมดพัฒนา
```bash
npm run dev
```

#### รันพร้อม Cron Jobs (แนะนำ)
```bash
npm run dev:all
```

#### รันในโหมด Production
```bash
npm run build
npm start
```

แอปพลิเคชันจะรันที่: `http://localhost:3000`

## การใช้งาน

### บัญชีผู้ดูแลเริ่มต้น
- **Username**: `admin`
- **Password**: `admin123`
- **อีเมล**: `admin@nstru.ac.th`

### บัญชีผู้ใช้ทดสอบ
- **Username**: `user01` / **Password**: `passuser01`
- **Username**: `user02` / **Password**: `passuser02`

### การเข้าใช้งานครั้งแรก

1. **เข้าสู่ระบบ**: ไปที่ `http://localhost:3000/login`
2. **สำหรับผู้ดูแล**: ใช้บัญชี admin เพื่อจัดการระบบ
3. **สำหรับผู้ใช้ทั่วไป**: ลงทะเบียนใหม่หรือใช้บัญชีทดสอบ

### ขั้นตอนการส่งคำขอโดเมน

1. **เข้าสู่ระบบ** ด้วยบัญชีผู้ใช้
2. ไปที่หน้า **"ส่งคำขอโดเมนใหม่"**
3. กรอกข้อมูลที่จำเป็น:
   - ชื่อโดเมนที่ต้องการ
   - IP Address
   - ข้อมูลผู้ขอและผู้รับผิดชอบ
   - วัตถุประสงค์การใช้งาน
   - ระยะเวลาใช้งาน
4. **ส่งคำขอ** และรอการอนุมัติ

### การจัดการคำขอ (สำหรับผู้ดูแล)

1. เข้าสู่ระบบด้วยบัญชีผู้ดูแล
2. ไปที่หน้า **"จัดการคำขอ"**
3. ดูรายละเอียดคำขอและตัดสินใจ **อนุมัติ** หรือ **ปฏิเสธ**
4. ระบบจะสร้างเอกสารและส่งอีเมลแจ้งผลอัตโนมัติ

## คำสั่งสำคัญ

### คำสั่งพื้นฐาน
```bash
npm run dev          # รันในโหมดพัฒนา
npm run build        # สร้างไฟล์ production
npm run start        # รันโหมด production
npm run lint         # ตรวจสอบโค้ด
```

### คำสั่งฐานข้อมูล
```bash
npm run generate     # สร้าง Prisma Client
npm run seedBase     # เพิ่มข้อมูลเริ่มต้น
npm run seed4        # เพิ่มข้อมูลตัวอย่างเพิ่มเติม
```

### คำสั่ง Cron Jobs
```bash
npm run cron         # รัน cron job ตรวจสอบสถานะโดเมน
npm run dev:all      # รันแอปและ cron พร้อมกัน
```

## การแก้ปัญหาเบื้องต้น

### ปัญหา: ไม่สามารถเชื่อมต่อฐานข้อมูลได้
```bash
# ตรวจสอบ MySQL service
# Windows
net start mysql

# Linux/Mac
sudo systemctl start mysql
# หรือ
brew services start mysql
```

### ปัญหา: Port 3000 ถูกใช้งานแล้ว
```bash
# หาและหยุดกระบวนการที่ใช้ port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### ปัญหา: Prisma Schema ไม่อัพเดท
```bash
npx prisma generate
npx prisma db push --force-reset
npm run seedBase
```

## การปรับแต่งเพิ่มเติม

### เปลี่ยนพอร์ต
แก้ไขไฟล์ `package.json`:
```json
"scripts": {
  "dev": "next dev -p 8080"
}
```

### เปลี่ยน Base URL
แก้ไขไฟล์ `.env.local`:
```bash
NEXTAUTH_URL="http://yourdomain.com:3000"
```

### ตั้งค่า HTTPS (Production)
```bash
NEXTAUTH_URL="https://yourdomain.com"
```

## การบำรุงรักษา

### การสำรองข้อมูล
```bash
# สำรองฐานข้อมูล MySQL
mysqldump -u root -p dev_db > backup_$(date +%Y%m%d).sql
```

### ตรวจสอบ Log
```bash
# ดู log ของแอปพลิเคชัน
tail -f logs/app.log

# ดู log ของ cron jobs
tail -f logs/cron.log
```

### อัพเดทระบบ
```bash
# อัพเดท dependencies
npm update

# ตรวจสอบ security vulnerabilities
npm audit
npm audit fix
```

## การติดตั้งบน Production Server

### ใช้ PM2 (Process Manager)
```bash
# ติดตั้ง PM2
npm install -g pm2

# รันด้วย PM2
npm run build
pm2 start npm --name "web-domain-nstru" -- start

# Auto start เมื่อ server restart
pm2 startup
pm2 save
```

### ใช้ Docker (ถ้าต้องการ)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบไฟล์ log ใน console
- ตรวจสอบการตั้งค่า `.env.local`
- ดูเอกสาร Next.js: https://nextjs.org/docs
- ดูเอกสาร Prisma: https://www.prisma.io/docs

---

**หมายเหตุ**: คู่มือนี้สร้างขึ้นจากการวิเคราะห์โค้ดในวันที่ 26 กันยายน 2025 หากมีการเปลี่ยนแปลงโครงสร้างโปรเจค อาจจำเป็นต้องปรับปรุงคู่มือให้เหมาะสม
