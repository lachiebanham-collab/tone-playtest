/**
 * Tone playtest → Google Sheet
 *
 * Paste this into Extensions → Apps Script on the Sheet that should collect answers,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Each form submission appends one row to the first sheet.
 */

const TASK_NAMES = [
  "Swipe deck",
  "Undo",
  "Pin a colour",
  "New collection",
  "Saved + filter",
  "Similar & Vol 2",
  "Palette from photo",
  "Share as image",
  "Choose a colour",
  "Describe a feeling",
  "Hex codes & dark mode"
];

// [column header, payload key]
const COLUMNS = [
  ["Submitted", "submittedAt"],
  ["Name", "name"],
  ["iPhone", "iphone"],
  ["Design-y", "design"]
]
  .concat(TASK_NAMES.flatMap((name, i) => [
    [`${i + 1}. ${name} (0–5)`, `t${i + 1}Score`],
    [`${i + 1}. ${name} — note`, `t${i + 1}Note`]
  ]))
  .concat([
    ["Keep it?", "keep"],
    ["Loved", "loved"],
    ["Bugged them", "bugged"],
    ["Would use it for", "useFor"],
    ["One more thing", "oneMore"],
    ["Device", "userAgent"],
    ["Raw JSON", "__raw"]
  ]);

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const raw = e && e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(raw);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(([header]) => header));
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    }

    sheet.appendRow(COLUMNS.map(([, key]) => {
      if (key === "__raw") return raw;
      if (key === "submittedAt") return data.submittedAt ? new Date(data.submittedAt) : new Date();
      const value = data[key];
      return value == null ? "" : value;
    }));

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to check the deployment is live.
function doGet() {
  return ContentService.createTextOutput("Tone playtest collector is running.");
}
