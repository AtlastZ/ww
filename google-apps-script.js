/**
 * =========================================================================
 * Google Apps Script สำหรับรับข้อมูล RSVP และคำอวยพร (Wedding E-Card)
 * คู่สมรส: คุณสิริลักษณ์ แตงกระโทก & คุณพีรพัฒน์ สุขเกษม
 * =========================================================================
 * 
 * ความปลอดภัยที่เพิ่มขึ้น (Security Hardened):
 * 1. กำหนด TARGET_SPREADSHEET_ID ให้เขียนได้เฉพาะ Sheet ID นี้เพียงไฟล์เดียวเท่านั้น
 * 2. ป้องกัน Formula Injection: เติม single quote นำหน้าข้อความที่ขึ้นต้นด้วย = , + , - , @
 * 3. ป้องกัน Spam Bot ด้วย Honeypot field (ฟิลด์ดักบอท)
 * 4. จำกัดความยาวตัวอักษรเพื่อป้องกัน Buffer / Resource Flooding
 * 5. ซ่อน Sheet ID ออกจาก doGet เพื่อไม่ให้เปิดเผย ID สู่สาธารณะ
 */

// 🔒 กำหนด Spreadsheet ID ที่อนุญาตให้เขียนข้อมูลได้เพียงไฟล์นี้ไฟล์เดียวเท่านั้น
const TARGET_SPREADSHEET_ID = '1ez4NB4q0Yv7mr4-SBOCT1OR18Opw7c7l_f_HnL6Glc0';

/**
 * ฟังก์ชันทำความสะอาดข้อมูลและป้องกัน Formula Injection
 */
function sanitize(val, maxLength) {
  if (val === null || val === undefined) return '-';
  var str = String(val).trim();
  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  // ป้องกันสูตรใน Google Sheets / Excel
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return str || '-';
}

// ฟังก์ชัน GET สำหรับทดสอบสถานะ โดยไม่เปิดเผย Sheet ID
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ฟังก์ชันหลักที่ทำงานเมื่อมี POST request จากหน้าเว็บ
function doPost(e) {
  var lock = LockService.getScriptLock();
  // รอล็อคสูงสุด 30 วินาที เพื่อป้องกันกรณีมีคนส่งพร้อมกันหลายคน
  lock.tryLock(30000);

  try {
    // 1. จำกัดให้เปิดและเขียนได้เฉพาะ Google Sheet ID ที่ระบุไว้เท่านั้น
    var ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    if (!ss || ss.getId() !== TARGET_SPREADSHEET_ID) {
      throw new Error("Unauthorized Spreadsheet Target");
    }

    var params = e.parameter || {};
    if (e.postData && e.postData.contents) {
      try {
        var jsonData = JSON.parse(e.postData.contents);
        for (var key in jsonData) {
          params[key] = jsonData[key];
        }
      } catch (err) {}
    }

    // 2. ป้องกัน Spam Bot ด้วย Honeypot
    // หากมีค่าในฟิลด์ดักบอท (website หรือ botField) ให้ตอบรับปกติแต่ไม่บันทึกลงชีต
    if (params.website || params.botField) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "success"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2.1 คำขอมอบของขวัญ (ชื่อ + ข้อความ + สลิปโอนเงิน) แยกไปบันทึกที่แท็บ Gifts และ Drive
    if (params.action === 'gift') {
      return handleGiftSubmission(ss, params);
    }

    // 3. ตรวจสอบและ Sanitize ข้อมูล
    var name = sanitize(params.name || params.Name, 100);
    if (!name || name === '-') {
      throw new Error("Name is required");
    }

    var attending = sanitize(params.attending || params.Attending || params.status || params.attendance, 50);
    var guests = sanitize(params.guests || params.Guests, 10);
    var email = sanitize(params.email || params.Email || params.phone, 50);
    var notes = sanitize(params.notes || params.Notes || params.note, 500);
    var timestamp = new Date();

    var sheet = ss.getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Attending", "Guests", "Email", "Notes"]);
    }

    sheet.appendRow([timestamp, name, attending, guests, email, notes]);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * บันทึกคำขอมอบของขวัญ: ชื่อ + ข้อความ ลงแท็บ "Gifts"
 * และอัปโหลดภาพสลิปโอนเงิน (base64) ขึ้น Google Drive
 */
function handleGiftSubmission(ss, params) {
  var name = sanitize(params.name, 100);
  if (!name || name === '-') {
    throw new Error("Name is required");
  }
  var note = sanitize(params.note, 300);
  var fileUrl = '-';

  if (params.slipBase64) {
    var mimeType = params.slipMimeType || 'image/jpeg';
    var filename = sanitize(params.slipFilename || 'slip.jpg', 100);
    var bytes = Utilities.base64Decode(params.slipBase64);
    var blob = Utilities.newBlob(bytes, mimeType, filename);
    var folder = getOrCreateGiftFolder();
    var file = folder.createFile(blob);
    fileUrl = file.getUrl();
  }

  var giftSheet = ss.getSheetByName('Gifts');
  if (!giftSheet) {
    giftSheet = ss.insertSheet('Gifts');
    giftSheet.appendRow(["Timestamp", "Name", "Note", "Slip"]);
  }
  giftSheet.appendRow([new Date(), name, note, fileUrl]);

  return ContentService.createTextOutput(JSON.stringify({
    result: "success"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * หาโฟลเดอร์ Drive สำหรับเก็บภาพสลิป หรือสร้างใหม่ถ้ายังไม่มี
 */
function getOrCreateGiftFolder() {
  var folderName = 'Wedding Gift Slips';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}
