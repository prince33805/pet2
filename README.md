# 🐾 Pet2 – Pet Service Management System

Pet2 คือระบบบริหารจัดการร้านบริการสัตว์เลี้ยงแบบครบวงจร  
รองรับการจัดการลูกค้า สัตว์เลี้ยง การจองคิว (Appointment & Slot)  
บริการและตัวเลือกเสริม (Service / Option) การชำระเงิน และรีวิว  
ออกแบบเป็น **Full-stack Web Application** พร้อมใช้งานจริงและ deploy ด้วย Docker

---

## 📁 Project Structure

project/
├── backend/ # NestJS + Prisma + PostgreSQL (REST API)
├── frontend/ # Web UI (SPA)
├── nginx/ # Reverse Proxy
└── docker-compose.yml

---

## 🛠 Technology Stack

### Backend

- **NestJS** – REST API Framework
- **Prisma ORM** – Database ORM
- **PostgreSQL** – Database
- **JWT Authentication**
- **Cron Job**
- **Docker**

### Frontend

- SPA Framework (React / Next.js / Vite-based)
- API integration กับ Backend
- Responsive UI (Navbar / Sidebar)

### Infrastructure

- **Nginx** – Reverse Proxy
- **Docker Compose**
- **PostgreSQL 15**

---

## 🗄 Database Schema (Prisma)

### Main Entities

- **Customer** – ลูกค้า
- **Pet** – สัตว์เลี้ยงของลูกค้า
- **Service / Option** – บริการและตัวเลือกเสริม
- **Slot** – ช่วงเวลาที่เปิดให้จอง
- **Appointment** – การจองบริการ
- **Order** – การชำระเงิน
- **Staff / Branch** – พนักงานและสาขา
- **Review** – รีวิวหลังใช้บริการ

### Design Highlights

- รองรับหลายบริการ + หลาย option ต่อ 1 appointment
- ใช้ `priceAtBooking` เพื่อป้องกันราคาย้อนหลังเปลี่ยน
- แยก Slot พร้อม capacity
- รองรับหลาย appointment ต่อ order
- มี index สำหรับ query และ pagination

---

## ⚙️ Backend Features (NestJS)

### Core Configuration

- `setGlobalPrefix('/api')`
- `enableCors() for some origin`
- **TransformInterceptor**
- **HttpExceptionFilter**
- **LoggingMiddleware**
- **RoleGuard & JwtGuard**

### Authentication (auth)

- Login / Register
    - Customer
    - Staff
- JWT Strategy
- Role-based Authorization (MANAGER / STAFF)

### Appointment (Core Business Flow)

- เลือก: Customer (Owner) , Pet , Slot , Services + Options
- ทำงานแบบ Transaction
    - ตรวจสอบ slot availability
    - สร้าง Order
    - ลด remaining slot
    - Insert ข้อมูล

### Slot Management

- Cron Job รันทุกวันที่ 1 ของเดือน
- Generate slot ล่วงหน้า 30 วัน
- เฉพาะวันทำงาน (Weekday)
- 1 ชั่วโมงต่อ slot
- Capacity = 10 ต่อ slot

### Modules

- GET
    - รองรับ pagination (page, limit)
    - sorting
    - query filter

- CREATE / UPDATE
    - ใช้ DTO + Validation

--- 

## 🖥️ Frontend Features

### Layout

- Navbar
- Sidebar

### Pages

- Authentication
    - Login, Register
- Cashier Page
    - ค้นหา Customer เลือกPet เลือกService/Option 
    - เลือกวันเวลาที่ต้องการจอง (Calendar), SummaryCard (สรุปราคา)
- Order Page
    - List Order / Appointment
    - ดูรายละเอียดรายรายการ
- Service Page
    - List / View
    - Create / Update / Delete
- Pet Page
    - List สัตว์เลี้ยง
- Customer Page
    - List ลูกค้า
    - View ลูกค้า + สัตว์เลี้ยงทั้งหมด

### API Layer

- แยก API route สำหรับเรียก backend
- รองรับ auth token

---

## 🐳 Docker Compose

### Services

- db – PostgreSQL 15
- backend – NestJS API
- nginx – Reverse Proxy

---

🔄 System Flow
Frontend
↓
Nginx (/api)
↓
Backend (NestJS)
↓
Prisma
↓
PostgreSQL

---

🚀 จุดเด่นของโปรเจกต์

✔️ ออกแบบตาม flow ธุรกิจจริง
✔️ รองรับหลายบริการต่อการจอง
✔️ ป้องกัน race condition ด้วย transaction
✔️ Slot auto-generate ด้วย cron
✔️ พร้อม deploy ด้วย Docker
✔️ โครงสร้าง code scale ได้ง่าย
