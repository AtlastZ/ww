# 💒 เว็บไซต์การ์ดแต่งงาน (Wedding E-Card)
### คุณสิริลักษณ์ แตงกระโทก & คุณพีรพัฒน์ สุขเกษม

เว็บไซต์การ์ดแต่งงานแบบ Single Page HTML สไตล์ **Warm Terracotta & Gold** พร้อมระบบตอบรับการเข้าร่วมงาน (R.S.V.P) และส่งคำอวยพร บันทึกลง **Google Sheets** โดยตรง ออกแบบมาสำหรับ Deploy ขึ้น **GitHub Pages** ได้ฟรีทันที

---

## 📁 โครงสร้างไฟล์ในโฟลเดอร์ `web/`

- **`index.html`** : หน้าเว็บ E-Card หลัก (รวมสไตล์, แอนิเมชัน, ฟอนต์ และระบบส่งข้อมูล)
- **`google-apps-script.js`** : โค้ดสำหรับวางใน Google Sheets เพื่อรับข้อมูลเข้าแผ่นงาน
- **`README.md`** : คู่มือการติดตั้งและใช้งาน

---

## 🚀 ระบบ Google Sheets & Apps Script ที่สร้างไว้ให้แล้ว

ปัจจุบันระบบได้เชื่อมต่อกับ Google Sheet และ Google Apps Script ให้เรียบร้อยแล้ว:

- 📊 **Google Sheet:** [คลิกเปิด Google Sheet "RSVP Wedding"](https://docs.google.com/spreadsheets/d/1ez4NB4q0Yv7mr4-SBOCT1OR18Opw7c7l_f_HnL6Glc0/edit)
- 🔗 **Google Apps Script Web App URL:**
  ```
  https://script.google.com/macros/s/AKfycbyxokCp6LUfHgMEAcDgvBqmn24wAEem0gWGatz_YL9Z-mMyTBg9xg2g5DXI9iqtEDDa/exec
  ```
- ✅ URL นี้ได้ถูกนำไปใส่ใน `CONFIG.GOOGLE_SHEETS_SCRIPT_URL` ใน `index.html` เรียบร้อยแล้ว พร้อมใช้งานได้ทันที!

---

## 🌐 ขั้นตอนที่ 3: Deploy ขึ้น GitHub Pages

### วิธีที่ 1: Deploy โฟลเดอร์ `web/`
1. Push โค้ดทั้งหมดขึ้น GitHub Repository ของคุณ
2. ไปที่หน้า GitHub Repo > แท็บ **Settings** > เมนูด้านซ้ายเลือก **Pages**
3. ภายใต้หัวข้อ **Build and deployment**:
   - **Source:** เลือก `Deploy from a branch`
   - **Branch:** เลือก `main` หรือ `master` และเลือกโฟลเดอร์ `/web` (หรือ `/root` หากย้ายไฟล์มาไว้ที่ root)
4. กด **Save** รอประมาณ 1-2 นาที GitHub จะสร้างลิงก์เว็บไซต์ให้คุณ เช่น:
   `https://<username>.github.io/<repo-name>/`

---

## 📊 ข้อมูลที่ถูกบันทึกลง Google Sheets

เมื่อแขกตอบรับผ่านหน้าเว็บ สคริปต์จะสร้างแท็บแผ่นงานให้อัตโนมัติ:

1. **แท็บ `RSVP`**:
   - วัน-เวลาที่ตอบรับ
   - ชื่อ - นามสกุล
   - ฝ่ายที่เชิญ (เจ้าสาว / เจ้าบ่าว)
   - สถานะการมาร่วมงาน (สะดวกเข้าร่วมงาน / ไม่สะดวก)
   - จำนวนผู้ร่วมงาน
   - เบอร์โทรศัพท์ติดต่อ
   - ข้อความเพิ่มเติม / แพ้อาหาร
2. **แท็บ `Wishes`**:
   - วัน-เวลาที่ส่งคำอวยพร
   - ชื่อผู้ส่ง
   - ข้อความอวยพรบ่าวสาว

---

## ✨ คุณสมบัติเด่นของหน้าเว็บ

- **Palette & Luxury Typography:** ธีมสีดินเผา Terracotta (`#9E4A28`) ตัดกับสีทองหรูหรา (`#C59A4E`) บนผิวกระดาษคอตตอนงาช้าง
- **Interactive Wax Seal:** ตราประทับขี้ผึ้งแวววาว เมื่อแตะจะมี Animation ยุบตัวแล้วเลื่อนหน้าจอลงมายังการ์ดเชิญอย่างนุ่มนวล
- **Live Countdown:** นับถอยหลังสู่วันงาน (๑๗ มกราคม ๒๕๗๐) แบบเรียลไทม์
- **Add to Calendar:** รองรับทั้ง Google Calendar และดาวน์โหลดไฟล์ `.ics` สำหรับ Apple Calendar / Outlook
- **Google Maps Direct:** เชื่อมต่อไปยังพิกัดร้าน "ครัวครบรส บุรีรมย์ การ์เด้น"
- **Ambient Romantic Sound:** เสียงกระดิ่งเมโลดี้หวานละมุนอ่อนโยน (เปิด/ปิด ได้ที่มุมขวาบน)
- **Responsive & Mobile-First:** ปรับแต่งให้อ่านง่าย สบายตาบนหน้าจอมือถือทุกรุ่น
