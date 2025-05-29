# ระบบแจ้งซ่อมไฟฟ้า - HTML Form

ฟอร์มสำหรับกรอกข้อมูลผู้แจ้งซ่อมไฟฟ้า สำหรับใช้งานกับ LINE Official Account และ Google Apps Script

## 📁 โครงสร้างไฟล์

```
repair-form/
├── index.html      # หน้าฟอร์มหลัก
├── styles.css      # CSS Styles
├── script.js       # JavaScript Logic
├── vercel.json     # Vercel Configuration
└── README.md       # คู่มือนี้
```

## 🚀 การ Deploy บน Vercel

### 1. เตรียม GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/repair-form.git
git push -u origin main
```

### 2. Connect กับ Vercel
1. ไปที่ [vercel.com](https://vercel.com)
2. เข้าสู่ระบบด้วย GitHub
3. คลิก "New Project"
4. เลือก Repository ที่สร้าง
5. กด "Deploy"

### 3. ได้ URL
- Vercel จะให้ URL เช่น: `https://repair-form-abc123.vercel.app`

## ⚙️ การตั้งค่า

### 1. อัปเดต JavaScript
แก้ไขในไฟล์ `script.js`:
```javascript
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### 2. อัปเดต Google Apps Script
แก้ไขในไฟล์ `Code.gs`:
```javascript
var VERCEL_FORM_URL = "https://your-repair-form.vercel.app";
```

### 3. Deploy GAS ใหม่
1. ใน GAS Editor กด "Deploy" → "New deployment"
2. เลือก "Web app"
3. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone**

## 🔗 การเชื่อมต่อ

### Flow การทำงาน:
1. ผู้ใช้พิมพ์ "แจ้งซ่อม" ใน LINE
2. GAS ตรวจสอบข้อมูลผู้ใช้
3. หากไม่มีข้อมูล → ส่งลิงก์ Vercel Form
4. ผู้ใช้กรอกฟอร์ม → ส่งข้อมูลไป GAS
5. GAS บันทึกลง Google Sheets → แจ้งกลับ LINE
6. ดำเนินการถามรหัสเสาไฟและอาการเสียต่อ

### LINE Webhook Setup:
1. ใน LINE Developer Console
2. อัปเดต Webhook URL เป็น GAS Web App URL
3. เปิดใช้งาน Webhook

## 🧪 การทดสอบ

### 1. ทดสอบฟอร์ม
- เปิด URL ของ Vercel
- ทดสอบกรอกข้อมูลและส่ง
- ตรวจสอบใน Browser Console

### 2. ทดสอบ LINE Integration
- ส่งข้อความ "แจ้งซ่อม" ใน LINE
- ตรวจสอบว่าได้รับลิงก์ฟอร์ม
- กรอกฟอร์มและตรวจสอบผลลัพธ์

### 3. ตรวจสอบ Google Sheets
- เช็คว่าข้อมูลถูกบันทึกใน Sheets
- ตรวจสอบ Format ของข้อมูล

## 🛠️ การแก้ไข

### เปลี่ยน URL ที่สำคัญ:

**ใน script.js:**
```javascript
// บรรทัดที่ 4
const GAS_WEBHOOK_URL = 'YOUR_GAS_WEBHOOK_URL_HERE';
```

**ใน Code.gs (GAS):**
```javascript
// บรรทัดที่ 11
var VERCEL_FORM_URL = "YOUR_VERCEL_URL_HERE";
```

### แก้ไขรายการหมู่บ้าน:
ใน `index.html` ส่วน select มหู่บ้าน:
```html
<select name="moo" id="moo" class="form-select" required>
    <option value="">-- เลือกหมู่บ้าน --</option>
    <!-- เพิ่ม/แก้ไขรายการหมู่บ้านตรงนี้ -->
</select>
```

## 📱 Mobile Optimization

- รองรับ LINE Internal Browser
- Responsive Design
- Touch-friendly Interface
- Auto-focus และ Auto-validation

## 🔒 Security Features

- CORS Protection
- Input Validation
- XSS Protection
- Content Security Policy

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย:

1. **CORS Error**
   - ตรวจสอบ GAS doOptions function
   - ใช้ `mode: 'cors'` ใน fetch

2. **Form ไม่ส่งข้อมูล**
   - ตรวจสอบ GAS_WEBHOOK_URL
   - ดู Browser Console สำหรับ errors

3. **LINE ไม่แสดงลิงก์**
   - ตรวจสอบ VERCEL_FORM_URL ใน GAS
   - ตรวจสอบ LINE Webhook URL

4. **ข้อมูลไม่บันทึกใน Sheets**
   - ตรวจสอบ SPREADSHEET_ID
   - ตรวจสอบสิทธิ์ GAS

## 📞 การติดต่อ

หากมีปัญหาในการใช้งาน:
1. ตรวจสอบ Browser Console
2. ดู GAS Execution Logs
3. ตรวจสอบ Vercel Function Logs

## 📝 Change Log

### v1.0.0
- ฟอร์มพื้นฐานสำหรับกรอกข้อมูลผู้แจ้ง
- เชื่อมต่อกับ GAS Webhook
- รองรับ Mobile และ LINE Browser
- Auto-validation และ Error handling

---

🔧 **Built with:** HTML5, CSS3, Vanilla JavaScript, Vercel, Google Apps Script