/**
 * =========================================================================
 * Google Apps Script สำหรับรับข้อมูล RSVP และคำอวยพร (Wedding E-Card)
 * คู่สมรส: คุณสิริลักษณ์ แตงกระโทก & คุณพีรพัฒน์ สุขเกษม
 * =========================================================================
 * 
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets ใหม่ (เช่น ตั้งชื่อว่า "Wedding Sirilak & Peerapat - RSVP")
 * 2. ไปที่เมนู ส่วนขยาย (Extensions) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดไฟล์นี้ลงไป
 * 4. กดปุ่มบันทึก (รูปแผ่นดิสก์)
 * 5. กดปุ่ม "การทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 *    - คำอธิบาย: Wedding RSVP Webhook
 *    - ดำเนินการในฐานะ (Execute as): "ฉัน" (Me - บัญชี Google ของคุณ)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone) **สำคัญมาก ต้องเลือก Anyone**
 * 7. กด "การทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL ของเว็บแอป" (Web app URL)
 * 8. นำ URL ที่ได้ไปใส่ในไฟล์ index.html ตรงตัวแปร CONFIG.GOOGLE_SHEETS_SCRIPT_URL
 */

// ฟังก์ชันหลักที่ทำงานเมื่อมี POST request จากหน้าเว็บ
function doPost(e) {
  var lock = LockService.getScriptLock();
  // รอล็อคสูงสุด 30 วินาที เพื่อป้องกันกรณีมีคนส่งพร้อมกันหลายคน
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data;

    // ตรวจสอบรูปแบบข้อมูลที่ส่งมา (JSON หรือ Form Data)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    var action = data.action || 'rsvp';
    var timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");

    if (action === 'wish') {
      // -------------------------------------------------------------
      // บันทึกคำอวยพร (Wishes) ลง Sheet "Wishes"
      // -------------------------------------------------------------
      var wishesSheet = ss.getSheetByName("Wishes");
      if (!wishesSheet) {
        wishesSheet = ss.insertSheet("Wishes");
        wishesSheet.appendRow(["วัน-เวลาที่ส่ง", "ชื่อผู้ส่งคำอวยพร", "ข้อความอวยพร"]);
        wishesSheet.getRange("A1:C1").setBackground("#A85D3B").setFontColor("#FFFFFF").setFontWeight("bold");
        wishesSheet.setFrozenRows(1);
      }

      wishesSheet.appendRow([
        timestamp,
        data.name || '-',
        data.message || '-'
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกคำอวยพรเรียบร้อยแล้ว",
        action: "wish"
      })).setMimeType(ContentService.MimeType.JSON);

    } else {
      // -------------------------------------------------------------
      // บันทึกการตอบรับเข้าร่วมงาน (RSVP) ลง Sheet "RSVP"
      // -------------------------------------------------------------
      var rsvpSheet = ss.getSheetByName("RSVP");
      if (!rsvpSheet) {
        rsvpSheet = ss.insertSheet("RSVP");
        rsvpSheet.appendRow([
          "วัน-เวลาที่ตอบรับ",
          "ชื่อ - นามสกุล",
          "ฝ่ายที่เชิญ",
          "สถานะการมาร่วมงาน",
          "จำนวนผู้ร่วมงาน (รวมตัวเอง)",
          "เบอร์โทรศัพท์ติดต่อ",
          "ข้อความเพิ่มเติม / หมายเหตุ"
        ]);
        rsvpSheet.getRange("A1:G1").setBackground("#9E4A28").setFontColor("#FFFFFF").setFontWeight("bold");
        rsvpSheet.setFrozenRows(1);
      }

      rsvpSheet.appendRow([
        timestamp,
        data.name || '-',
        data.side || 'ไม่ระบุ',
        data.attendance || 'ไม่ระบุ',
        data.guests || 1,
        data.phone || '-',
        data.note || '-'
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกข้อมูล RSVP เรียบร้อยแล้ว",
        action: "rsvp"
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// ฟังก์ชัน GET สำหรับทดสอบการเปิด URL บนบราวเซอร์โดยตรง
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Wedding RSVP Google Apps Script Web App is running successfully!",
    time: Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}
