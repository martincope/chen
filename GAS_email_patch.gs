// ──────────────────────────────────────────────────────────────────────────────
// GAS Main.gs 修補：在 processForm() 寄信時夾帶 Excel 附件
// 把下方的寄信邏輯替換原本的 MailApp.sendEmail() 或 GmailApp.sendEmail()
// ──────────────────────────────────────────────────────────────────────────────

function processForm(e) {
  // 1. 解析 JSON（React 用 text/plain 送出）
  var data = JSON.parse(e.postData.contents);

  var clientEmail   = data.clientEmail   || '';
  var clientTitle   = data.clientTitle   || '客戶';
  var projectName   = data.projectName   || '專案';
  var agentName     = data.agentName     || '';
  var totalPrice    = data.totalPrice    || '0';
  var excelBase64   = data.excelBase64   || '';
  var excelFilename = data.excelFilename || ('報價單_' + clientTitle + '.xls');

  // 2. 收件人（客戶 + 內部 CC）
  var ccList = 'newchin930@gmail.com,idwomantw@gmail.com,jilin771112@gmail.com';

  // 3. 信件內容
  var subject = '【獨立女子廣告】' + clientTitle + ' — ' + projectName + ' 報價單';
  var body =
    '您好，\n\n' +
    '感謝您對獨立女子廣告的支持，請參閱附件報價單。\n\n' +
    '客戶名稱：' + clientTitle + '\n' +
    '專案名稱：' + projectName + '\n' +
    '報價合計（未稅）：NT$ ' + Number(totalPrice).toLocaleString() + '\n' +
    '負責窗口：' + agentName + '\n\n' +
    '如有任何問題，歡迎隨時聯繫。\n\n' +
    '獨立女子廣告 IDW Ads\n' +
    'Tel: 02-7752-2532 #105';

  // 4. 建立 Excel 附件 blob
  var attachments = [];
  if (excelBase64) {
    var blob = Utilities.newBlob(
      Utilities.base64Decode(excelBase64),
      'application/vnd.ms-excel',
      excelFilename
    );
    attachments.push(blob);
  }

  // 5. 寄信
  GmailApp.sendEmail(clientEmail, subject, body, {
    cc: ccList,
    attachments: attachments,
    name: '獨立女子廣告 IDW Ads'
  });

  // 6. 回傳（可選：寫進 Google Sheets）
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', to: clientEmail }))
    .setMimeType(ContentService.MimeType.JSON);
}
