/**
 * Tone playtest -> Google Sheet
 *
 * Paste this into Extensions -> Apps Script on the Sheet that should collect answers,
 * then Deploy -> New deployment -> Web app (Execute as: Me, Who has access: Anyone).
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
    [`${i + 1}. ${name} (0-5)`, `t${i + 1}Score`],
    [`${i + 1}. ${name} - note`, `t${i + 1}Note`]
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

// ---------------------------------------------------------------------------
// Formatting: run formatSheet() once from the editor (or Tone -> Format sheet).
// Column formats and colour rules cover whole columns, so new answers pick them
// up automatically. Re-running is safe.
// ---------------------------------------------------------------------------

const ACCENT = "#FF2D55";
const HEADER_BG = "#1C1C1E";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Tone")
    .addItem("Format sheet", "formatSheet")
    .addToUi();
}

function columnIndex(key) {
  return COLUMNS.findIndex(([, k]) => k === key) + 1;
}

function columnLetter(index) {
  let letter = "";
  while (index > 0) {
    const mod = (index - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    index = Math.floor((index - 1) / 26);
  }
  return letter;
}

function formatSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  sheet.setName("Responses");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([header]) => header));
  }

  const lastCol = COLUMNS.length;
  const maxRows = sheet.getMaxRows();
  const body = (col) => sheet.getRange(2, col, Math.max(maxRows - 1, 1), 1);

  // Whole-sheet basics
  sheet.getRange(1, 1, maxRows, lastCol)
    .setFontFamily("Arial")
    .setFontSize(11)
    .setVerticalAlignment("top");

  // Header
  sheet.getRange(1, 1, 1, lastCol)
    .setValues([COLUMNS.map(([header]) => header)])
    .setBackground(HEADER_BG)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.setRowHeight(1, 52);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  // Light row banding (conditional colours below paint over it)
  sheet.getBandings().forEach((b) => b.remove());
  sheet.getRange(1, 1, maxRows, lastCol)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(HEADER_BG);

  // Column widths + wrapping
  const widths = {
    submittedAt: 150, name: 130, iphone: 130, design: 90,
    keep: 80, loved: 300, bugged: 300, useFor: 220, oneMore: 300, userAgent: 160, __raw: 120
  };
  COLUMNS.forEach(([, key], i) => {
    const col = i + 1;
    if (/^t\d+Score$/.test(key)) {
      sheet.setColumnWidth(col, 84);
      body(col).setHorizontalAlignment("center").setFontWeight("bold");
    } else if (/^t\d+Note$/.test(key)) {
      sheet.setColumnWidth(col, 240);
      body(col).setWrap(true);
    } else {
      sheet.setColumnWidth(col, widths[key] || 140);
      body(col).setWrap(["loved", "bugged", "useFor", "oneMore"].includes(key));
    }
  });
  body(columnIndex("userAgent")).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  body(columnIndex("submittedAt")).setNumberFormat("d mmm, h:mm am/pm");
  sheet.hideColumns(columnIndex("__raw"));

  // Colour rules: ease scores 0 (red) -> 5 (green), keep-it answers
  const rules = [];
  COLUMNS.forEach(([, key], i) => {
    if (!/^t\d+Score$/.test(key)) return;
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpointWithValue("#F4B6B6", SpreadsheetApp.InterpolationType.NUMBER, "0")
      .setGradientMidpointWithValue("#FCE8A6", SpreadsheetApp.InterpolationType.NUMBER, "2.5")
      .setGradientMaxpointWithValue("#B7E1CD", SpreadsheetApp.InterpolationType.NUMBER, "5")
      .setRanges([body(i + 1)])
      .build());
  });
  const keepRange = body(columnIndex("keep"));
  [["Yep", "#B7E1CD"], ["Maybe", "#FCE8A6"], ["Nah", "#F4B6B6"]].forEach(([text, colour]) => {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(text).setBackground(colour).setRanges([keepRange]).build());
  });
  keepRange.setHorizontalAlignment("center");
  sheet.setConditionalFormatRules(rules);

  buildSummary(ss, sheet);
  ss.setActiveSheet(sheet);
}

function buildSummary(ss, responses) {
  const name = "Summary";
  const summary = ss.getSheetByName(name) || ss.insertSheet(name, ss.getSheets().length);
  summary.clear();
  summary.getBandings().forEach((b) => b.remove());
  summary.setConditionalFormatRules([]);

  const src = "'" + responses.getName() + "'!";
  const rows = [["Task", "Avg ease (0-5)", "", "Couldn't do it", "Answers"]];
  TASK_NAMES.forEach((task, i) => {
    const col = columnLetter(columnIndex(`t${i + 1}Score`));
    const range = `${src}${col}2:${col}`;
    const r = i + 2;
    rows.push([
      `${i + 1}. ${task}`,
      `=IFERROR(ROUND(AVERAGE(${range}),1),"")`,
      `=IF(B${r}="","",SPARKLINE(B${r},{"charttype","bar";"max",5;"color1","${ACCENT}"}))`,
      `=COUNTIF(${range},0)`,
      `=COUNT(${range})`
    ]);
  });

  const keepCol = columnLetter(columnIndex("keep"));
  const keepRange = `${src}${keepCol}2:${keepCol}`;
  const keepStart = rows.length + 2;
  rows.push(["", "", "", "", ""]);
  rows.push(["Would you keep Tone?", "People", "", "", ""]);
  ["Yep", "Maybe", "Nah"].forEach((answer) => {
    rows.push([answer, `=COUNTIF(${keepRange},"${answer}")`, "", "", ""]);
  });

  summary.getRange(1, 1, rows.length, 5).setValues(rows);

  // Styling
  summary.getRange(1, 1, rows.length, 5).setFontFamily("Arial").setFontSize(11).setVerticalAlignment("middle");
  [1, keepStart].forEach((r) => {
    summary.getRange(r, 1, 1, 5).setBackground(HEADER_BG).setFontColor("#FFFFFF").setFontWeight("bold");
    summary.setRowHeight(r, 36);
  });
  summary.setFrozenRows(1);
  summary.setColumnWidth(1, 220);
  summary.setColumnWidth(2, 120);
  summary.setColumnWidth(3, 200);
  summary.setColumnWidth(4, 120);
  summary.setColumnWidth(5, 90);
  summary.getRange(2, 2, rows.length - 1, 4).setHorizontalAlignment("center");
  summary.getRange(2, 1, TASK_NAMES.length, 5).setBorder(null, null, true, null, null, null, "#E5E5EA", SpreadsheetApp.BorderStyle.SOLID);
  summary.setRowHeights(2, TASK_NAMES.length, 30);

  const avgRange = summary.getRange(2, 2, TASK_NAMES.length, 1);
  const gaveUpRange = summary.getRange(2, 4, TASK_NAMES.length, 1);
  summary.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpointWithValue("#F4B6B6", SpreadsheetApp.InterpolationType.NUMBER, "0")
      .setGradientMidpointWithValue("#FCE8A6", SpreadsheetApp.InterpolationType.NUMBER, "2.5")
      .setGradientMaxpointWithValue("#B7E1CD", SpreadsheetApp.InterpolationType.NUMBER, "5")
      .setRanges([avgRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0).setFontColor("#C62828").setBold(true)
      .setRanges([gaveUpRange]).build()
  ]);
}
