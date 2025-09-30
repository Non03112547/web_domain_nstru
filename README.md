# คู่มือติดตั้งและใช้งานระบบจัดการโดเมน (Web Domain Management System)

## รายละเอียดระบบ

ระบบ Web Domain Management เป็นเว็บแอปพลิเคชันที่ใช้จัดการคำขอโดเมนขององค์กร พัฒนาด้วย:

- **Frontend**: Next.js 15.3.5 with React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite (default) / MySQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4
- **Document Generation**: docx, docx-pdf, docxtemplater
- **Automation**: node-cron, Puppeteer
- **UI Components**: Framer Motion, Lucide React

---

## การติดตั้งระบบ

### ข้อกำหนดของระบบ

- Node.js 18 หรือสูงกว่า
- npm หรือ yarn
- SQLite (มีมาให้แล้ว) หรือ MySQL (เพิ่มเติม)
- LibreOffice

### ขั้นตอนการติดตั้ง

การติดตั้ง LibreOffice
1. ดาวน์โหลดและติดตั้ง
Windows:
bash# ดาวน์โหลดจาก https://www.libreoffice.org/download/
# หรือใช้ winget
winget install TheDocumentFoundation.LibreOffice

# หรือใช้ chocolatey
choco install libreoffice
Mac:
bash# ใช้ Homebrew
brew install --cask libreoffice
Linux (Ubuntu/Debian):
bashsudo apt update
sudo apt install libreoffice

#### 1. Clone หรือ Copy โปรเจค

```bash
# หากใช้ git
git clone -b Release-V-3.5 https://github.com/Non03112547/web_domain_nstru.git

cd web_domain


```

#### 2. ติดตั้ง Dependencies

```bash
npm install
```

#### 3. ตั้งค่าฐานข้อมูล

##### สำหรับ SQLite (แนะนำสำหรับการพัฒนา)

```bash
# Copy .env.example เป็น .env
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```bash
# Database
DATABASE_URL="file:./youData.db"

# NextAuth Secret (สร้าง secret ใหม่)
NEXTAUTH_SECRET="your-unique-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

##### สำหรับ MySQL

```bash
# Copy .env.example-mysql เป็น .env
cp .env.example-mysql .env
```

แก้ไขไฟล์ `.env`:

```bash
# Database
DATABASE_URL="mysql://username:password@localhost:3306/web_domain"

# NextAuth Secret
NEXTAUTH_SECRET="your-unique-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### 4. สร้างและ Migrate Database

```bash
# Generate Prisma Client
npm run generate

# สร้างตารางในฐานข้อมูล
npx prisma db push

# หรือใช้ migration (สำหรับ production)
npx prisma migrate deploy
```

#### 5. Seed ข้อมูลเริ่มต้น

```bash
# Seed ข้อมูล base (positions, admin user)
npm run seedBase

# หรือ seed ข้อมูลทดสอบ
npm run seed4
```

#### 6. Build และ Start (Production)

```bash
# Build สำหรับ production
npm run build

# Start production server
npm start
```

#### 7. Start Development Server

```bash
# Development mode
npm run dev

# Development พร้อม background cron jobs
npm run dev:all
```

---

## การใช้งานระบบ

### การเข้าสู่ระบบ

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. คลิก "เข้าสู่ระบบ"
3. ใส่ username และ password
   - Admin account จะถูกสร้างใน seed process

### ระบบสมัครสมาชิก

1. ผู้ใช้สามารถสมัครสมาชิกได้ที่หน้า Sign Up
2. Admin จะต้องอนุมัติก่อนที่ผู้ใช้จะสามารถใช้งานได้
3. ระบบจะส่งการแจ้งเตือนเมื่อมีการสมัครใหม่

### การจัดการคำขอโดเมน

#### สำหรับผู้ใช้ทั่วไป (USER):

1. **สร้างคำขอโดเมนใหม่**
   - กรอกข้อมูลโดเมนที่ต้องการ
   - ระบุ IP Address
   - เลือกประเภทเครื่อง (PC/Mac) และ OS
   - กรอกข้อมูลผู้ขอและผู้รับผิดชอบ
   - เลือกระยะเวลาใช้งาน (ถาวร/ชั่วคราว)

2. **ติดตามสถานะคำขอ**
   - ดูรายการคำขอทั้งหมดของตน
   - ตรวจสอบสถานะ (รออนุมัติ/อนุมัติ/ปฏิเสธ)

3. **แก้ไขคำขอ**
   - สามารถแก้ไขคำขอที่ยังไม่ได้รับการอนุมัติ

#### สำหรับผู้ดูแลระบบ (ADMIN):

1. **จัดการคำขอ**
   - ดูรายการคำขอทั้งหมด
   - อนุมัติ/ปฏิเสธคำขอ
   - ดูรายละเอียดคำขอ

2. **จัดการโดเมน**
   - ดูรายการโดเมนที่ใช้งานอยู่
   - จัดการสถานะโดเมน (Active/Expired/Trashed)
   - ลบโดเมนพร้อมบันทึก log

3. **จัดการผู้ใช้**
   - อนุมัติการสมัครสมาชิก
   - จัดการ role และ position
   - ดูข้อมูลผู้ใช้ทั้งหมด

4. **สร้างเอกสาร**
   - Generate Word document สำหรับคำขอ
   - Export ข้อมูลเป็น PDF

### ฟีเจอร์พิเศษ

#### 1. Auto Domain Status Update
```bash
# รัน cron job เพื่ออัพเดทสถานะโดเมน
npm run cron
```

#### 2. Document Generation
ระบบสามารถสร้างเอกสาร Word และ PDF อัตโนมัติจากข้อมูลคำขอ

#### 3. Email Notifications
ระบบแจ้งเตือนผ่านอีเมลเมื่อมีการอนุมัติ/ปฏิเสธคำขอ

---

## โครงสร้างไฟล์ที่สำคัญ

```
web_domain/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # หน้าจัดการ admin
│   │   ├── api/               # API Routes
│   │   ├── login/             # หน้าเข้าสู่ระบบ
│   │   ├── signUp/            # หน้าสมัครสมาชิก
│   │   └── page.js            # หน้าแรก
│   ├── components/            # React Components
│   ├── lib/                   # Utility functions
│   ├── scripts/               # Background scripts
│   └── uploads/               # File uploads
├── prisma/
│   ├── schema.prisma          # Database Schema
│   ├── seedBase.js            # ข้อมูลเริ่มต้น
│   └── seed4.js               # ข้อมูลทดสอบ
├── public/                    # Static files
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # คู่มือโครงการ
```

---

## การตั้งค่าเพิ่มเติม

### การตั้งค่าส่งอีเมล

เพิ่มใน `.env`:
```bash
EMAIL_SERVER="smtp://username:password@smtp.gmail.com:587"
EMAIL_FROM="noreply@example.com"
```

### การตั้งค่า File Upload

ระบบรองรับการอัปโลดไฟล์ในโฟลเดอร์ `src/uploads/`

### การตั้งค่า Cron Jobs

แก้ไขไฟล์ `src/scripts/updateDomainStatus.js` สำหรับกำหนดเวลาอัพเดทสถานะโดเมน

---

## การแก้ไขปัญหาเบื้องต้น

### ปัญหาฐานข้อมูล
```bash
# Reset database
npx prisma db push --force-reset
npm run seedBase
```

### ปัญหา Dependencies
```bash
# ล้างและติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### ปัญหา Permission
```bash
# Windows: รันเป็น Administrator
# Linux/Mac: ใช้ sudo หรือปรับ permission
chmod +x scripts/*.js
```

---

## การ Deploy Production

### 1. Environment Variables
ตั้งค่า production environment variables:

```bash
NODE_ENV=production
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### 2. Build และ Deploy
```bash
npm run build
npm start
```

### 3. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start npm --name "web-domain" -- start
pm2 startup
pm2 save
```

---

## สนับสนุนและติดต่อ

หากมีปัญหาหรือข้อสงสัย สามารถ:

1. ตรวจสอบ Console Log ในเบราว์เซอร์
2. ดู Server Log ใน Terminal
3. ตรวจสอบ Database ด้วย Prisma Studio: `npx prisma studio`
4. ดู Network Tab สำหรับ API calls

---

## การอัพเดทระบบ

### Backup ข้อมูล
```bash
# Backup SQLite
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Backup MySQL
mysqldump -u username -p database_name > backup.sql
```

### อัพเดท Dependencies
```bash
npm update
npm audit fix
```

ระบบนี้เป็นระบบจัดการโดเมนแบบครบวงจร เหมาะสำหรับองค์กรที่ต้องการควบคุมและติดตามการขอใช้โดเมนอย่างเป็นระบบ
