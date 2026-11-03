/**
 * LibraCore Google Sheets backend
 * Deploy as Web app: Execute as Me, access Anyone.
 * Keep this endpoint URL private to your deployment; this demo is intended for a trusted college team.
 */
const SPREADSHEET_ID = ""; // Optional: paste an existing Google Spreadsheet ID. Blank creates one on first run.
const BACKUP_FOLDER_NAME = "LibraCore Library Backups";
const SHEET_NAMES = ["Students", "Books", "Transactions"];
const HEADERS = {
  Students: ["id","studentId","name","department","course","year","phone","email","dob","photo"],
  Books: ["id","title","author","department","category","publisher","isbn","quantity","shelf"],
  Transactions: ["id","studentId","bookId","issueDate","dueDate","returnDate","fine","issuedBy"]
};

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  let result;
  try {
    const action = p.action || "getAll";
    const payload = p.payload ? JSON.parse(p.payload) : {};
    if (action === "getAll") result = {ok:true, data:readAll_()};
    else if (action === "saveAll") { saveAll_(payload); result = {ok:true, message:"Saved"}; }
    else if (action === "health") result = {ok:true, message:"LibraCore API is running"};
    else throw new Error("Unknown action: " + action);
  } catch (err) {
    result = {ok:false, error:String(err && err.message ? err.message : err)};
  }
  const json = JSON.stringify(result);
  const callback = p.callback;
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.action === "saveAll") saveAll_(body.data || {});
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = SPREADSHEET_ID || props.getProperty("SPREADSHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create("LibraCore College Library Database");
  props.setProperty("SPREADSHEET_ID", ss.getId());
  initializeSheets_(ss);
  return ss;
}

function initializeSheets_(ss) {
  SHEET_NAMES.forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS[name]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,HEADERS[name].length).setFontWeight("bold").setBackground("#122746").setFontColor("#ffffff");
      sh.autoResizeColumns(1, HEADERS[name].length);
    }
  });
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > SHEET_NAMES.length) ss.deleteSheet(defaultSheet);
}

function readAll_() {
  const ss = getSpreadsheet_();
  initializeSheets_(ss);
  const out = {};
  SHEET_NAMES.forEach(name => {
    const sh = ss.getSheetByName(name);
    const values = sh.getDataRange().getValues();
    const headers = values.shift().map(String);
    out[name.toLowerCase()] = values.filter(row => row.some(v => v !== "")).map(row => {
      const obj = {};
      headers.forEach((h,i) => {
        let v = row[i];
        if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
        obj[h] = v;
      });
      if (name === "Books") obj.quantity = Number(obj.quantity || 0);
      if (name === "Transactions") obj.fine = Number(obj.fine || 0);
      return obj;
    });
  });
  return out;
}

function saveAll_(data) {
  const ss = getSpreadsheet_();
  initializeSheets_(ss);
  const mapping = {Students:data.students || [], Books:data.books || [], Transactions:data.transactions || []};
  SHEET_NAMES.forEach(name => {
    const sh = ss.getSheetByName(name);
    const headers = HEADERS[name];
    const rows = mapping[name].map(obj => headers.map(h => obj[h] === undefined ? "" : obj[h]));
    const oldRows = Math.max(0, sh.getLastRow() - 1);
    if (oldRows) sh.getRange(2,1,oldRows,headers.length).clearContent();
    if (rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
    sh.setFrozenRows(1);
  });
}

function createDailyBackupTrigger() {
  // Run this function once from the Apps Script editor to schedule a daily Drive backup.
  const triggers = ScriptApp.getProjectTriggers();
  if (!triggers.some(t => t.getHandlerFunction() === "dailyDriveBackup")) {
    ScriptApp.newTrigger("dailyDriveBackup").timeBased().everyDays(1).atHour(2).create();
  }
  dailyDriveBackup();
}

function dailyDriveBackup() {
  const ss = getSpreadsheet_();
  initializeSheets_(ss);
  const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HHmm");
  const file = DriveApp.getFileById(ss.getId());
  file.makeCopy("LibraCore_Backup_" + stamp, folder);
}

function showDatabaseUrl() {
  const ss = getSpreadsheet_();
  Logger.log("Library database: " + ss.getUrl());
}

function setup() {
  const ss = getSpreadsheet_();
  initializeSheets_(ss);
  Logger.log("Setup complete. Database: " + ss.getUrl());
}