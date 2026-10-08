/**
 * MEL data quality audit: feedback by health worker.
 *
 * Reads the Submissions tab (graded by formulas), groups the records by health
 * worker and writes a new tab with one row per worker: counts by grade, the most
 * common problem, and a ready-to-send message listing each record that needs
 * attention. Grade labels and the "clear photo" label are read from the Rubric
 * tab, so changing the rubric needs no change here.
 */

const CONFIG = {
  SOURCE_SHEET: 'Submissions',
  RUBRIC_SHEET: 'Rubric',
  OUTPUT_SHEET: 'Feedback by Health Worker',
  GRADE_RANGE: 'A5:A7',        // Rubric: A - Usable, B - Fix, C - Discard
  CLEAR_PHOTO_CELL: 'B14',     // Rubric: photo status accepted as clear
  PHONE_OK: 'OK',
  DATE_OK: 'OK',
  DUPLICATE_OK: 'Unique',
  MAX_RECORDS_IN_MESSAGE: 8,
  HEADERS: {
    id: 'Record ID',
    facility: 'Facility',
    hw: 'Health Worker ID',
    photo: 'Photo Status',
    blank: 'Blank Fields',
    phone: 'Phone Check',
    date: 'Date Check',
    dup: 'Duplicate Check',
    grade: 'Grade',
    feedback: 'Feedback to Health Worker'
  }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MEL Audit')
    .addItem('Build feedback summary', 'buildFeedbackSummary')
    .addItem('Schedule weekly refresh (Mondays, 8am)', 'createWeeklyTrigger')
    .addToUi();
}

function buildFeedbackSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(CONFIG.SOURCE_SHEET);
  const rubric = ss.getSheetByName(CONFIG.RUBRIC_SHEET);
  if (!source || !rubric) {
    throw new Error('The Submissions and Rubric tabs are both required.');
  }

  const grades = rubric.getRange(CONFIG.GRADE_RANGE).getValues().map(function (r) { return r[0]; });
  const gradeUsable = grades[0];
  const clearPhoto = rubric.getRange(CONFIG.CLEAR_PHOTO_CELL).getValue();

  const values = source.getDataRange().getValues();
  const col = mapHeaders_(values[0]);

  // Group records by health worker.
  const workers = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const id = row[col.id];
    if (!id) continue;

    const hw = row[col.hw];
    if (!workers[hw]) {
      workers[hw] = { facility: row[col.facility], total: 0, grades: {}, issues: [], types: {} };
    }
    const w = workers[hw];
    w.total++;

    const grade = row[col.grade];
    w.grades[grade] = (w.grades[grade] || 0) + 1;
    if (grade !== gradeUsable) {
      w.issues.push(id + ': ' + row[col.feedback]);
    }

    if (row[col.photo] !== clearPhoto) count_(w.types, 'Photo not clear');
    if (row[col.phone] !== CONFIG.PHONE_OK) count_(w.types, 'Phone number');
    if (row[col.date] !== CONFIG.DATE_OK) count_(w.types, 'Dates');
    if (row[col.dup] !== CONFIG.DUPLICATE_OK) count_(w.types, 'Duplicate record');
    if (row[col.blank] > 0) count_(w.types, 'Blank fields');
  }

  // One output row per worker, lowest usable rate first.
  const ids = Object.keys(workers).sort(function (a, b) {
    return usableRate_(workers[a], gradeUsable) - usableRate_(workers[b], gradeUsable);
  });

  const header = ['Health Worker ID', 'Facility', 'Submitted', grades[0], grades[1], grades[2],
                  'Usable rate', 'Most common issue', 'Message'];
  const firstDataRow = 5;
  const rows = ids.map(function (hw, k) {
    const w = workers[hw];
    const r = firstDataRow + k;
    return [
      hw,
      w.facility,
      w.total,
      w.grades[grades[0]] || 0,
      w.grades[grades[1]] || 0,
      w.grades[grades[2]] || 0,
      '=IF(C' + r + '=0,0,D' + r + '/C' + r + ')',
      topIssue_(w.types),
      buildMessage_(hw, w, gradeUsable)
    ];
  });

  // Write the output tab.
  let out = ss.getSheetByName(CONFIG.OUTPUT_SHEET);
  if (!out) out = ss.insertSheet(CONFIG.OUTPUT_SHEET);
  out.clear();

  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy, HH:mm');
  out.getRange('A1').setValue('Feedback by health worker');
  out.getRange('A2').setValue('Built from the Submissions tab on ' + stamp +
    '. Run MEL Audit > Build feedback summary to refresh. Sorted by usable rate, lowest first.');
  out.getRange(4, 1, 1, header.length).setValues([header]);
  if (rows.length > 0) {
    out.getRange(firstDataRow, 1, rows.length, header.length).setValues(rows);
  }

  formatOutput_(out, header.length, rows.length, firstDataRow);

  try {
    ss.toast(rows.length + ' health workers summarised.', 'MEL Audit', 5);
  } catch (e) {
    // Toasts are not available when the script runs from a trigger.
  }
}

function createWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'buildFeedbackSummary') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('buildFeedbackSummary')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
  SpreadsheetApp.getActiveSpreadsheet().toast('Weekly refresh set for Mondays at 8am.', 'MEL Audit', 5);
}

// ---- helpers ----

function mapHeaders_(headerRow) {
  const col = {};
  Object.keys(CONFIG.HEADERS).forEach(function (key) {
    const idx = headerRow.indexOf(CONFIG.HEADERS[key]);
    if (idx === -1) throw new Error('Column not found on Submissions: ' + CONFIG.HEADERS[key]);
    col[key] = idx;
  });
  return col;
}

function count_(obj, key) {
  obj[key] = (obj[key] || 0) + 1;
}

function usableRate_(w, gradeUsable) {
  return w.total === 0 ? 0 : (w.grades[gradeUsable] || 0) / w.total;
}

function topIssue_(types) {
  let best = null;
  Object.keys(types).forEach(function (k) {
    if (best === null || types[k] > types[best]) best = k;
  });
  return best === null ? 'None' : best + ' (' + types[best] + ')';
}

function buildMessage_(hw, w, gradeUsable) {
  const usable = w.grades[gradeUsable] || 0;
  if (w.issues.length === 0) {
    return 'Hello ' + hw + ', all ' + w.total + ' of your records passed review. Thank you for the careful work.';
  }
  const shown = w.issues.slice(0, CONFIG.MAX_RECORDS_IN_MESSAGE);
  const extra = w.issues.length - shown.length;
  const lines = [
    'Hello ' + hw + ', here is feedback on the ' + w.total + ' records you submitted.',
    usable + ' passed review. ' + w.issues.length + ' need attention:'
  ];
  shown.forEach(function (line) { lines.push('- ' + line); });
  if (extra > 0) lines.push('- and ' + extra + ' more');
  lines.push('Please correct the details or retake the photo, then resubmit. Thank you.');
  return lines.join('\n');
}

function formatOutput_(sheet, nCols, nRows, firstDataRow) {
  const navy = '#1F3864';
  sheet.getRange(1, 1, sheet.getMaxRows(), nCols).setFontFamily('Arial').setFontSize(10);
  sheet.getRange('A1').setFontWeight('bold').setFontSize(14);
  sheet.getRange('A2').setFontStyle('italic');
  sheet.getRange(4, 1, 1, nCols)
    .setBackground(navy).setFontColor('#FFFFFF').setFontWeight('bold').setVerticalAlignment('middle');
  if (nRows > 0) {
    sheet.getRange(firstDataRow, 7, nRows, 1).setNumberFormat('0.0%');
    sheet.getRange(firstDataRow, 1, nRows, nCols).setVerticalAlignment('top');
    sheet.getRange(firstDataRow, 9, nRows, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }
  const widths = [120, 160, 85, 90, 90, 90, 90, 190, 560];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.setFrozenRows(4);
  sheet.setHiddenGridlines(true);
}
