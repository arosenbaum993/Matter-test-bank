/**
 * Code.gs: saves practice-assessment results to the Google Sheet this script is attached to.
 *
 * Setup (see README step 3):
 *   1. Create a Google Sheet. Extensions > Apps Script. Paste this file over Code.gs.
 *   2. Project Settings > Script Properties > add TEACHER_PASSCODE = (a passcode only you know).
 *   3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Copy the /exec URL into config.js.
 *
 * Student results arrive by POST. The teacher page reads them back by GET with the passcode.
 * Sheets created automatically: "Attempts" (one row per student attempt) and "Items" (one row per student per question).
 * Note: "Anyone" means anyone with the URL can submit a result, but only someone with the passcode can read results.
 */

var ATTEMPT_HEAD = ['Timestamp', 'Assessment ID', 'Title', 'Last', 'First', 'Period', 'Score', 'Possible', 'Percent', 'Seconds', 'Submission ID', 'Payload JSON'];
var ITEM_HEAD = ['Timestamp', 'Assessment ID', 'Last', 'First', 'Period', 'Item', 'Standard', 'DOK', 'Type', 'Earned', 'Possible', 'Response', 'Misconception tags'];

function sheet_(name, head) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var p = JSON.parse(e.postData.contents);
    if (!p || !p.aid || !p.sub || !p.items || !p.first || !p.last) return json_({ ok: false, error: 'Incomplete submission.' });
    var at = sheet_('Attempts', ATTEMPT_HEAD);
    // Ignore a repeat of the same submission (student pressed Try again after a slow save).
    var ids = at.getLastRow() > 1 ? at.getRange(2, 11, at.getLastRow() - 1, 1).getValues() : [];
    for (var i = 0; i < ids.length; i++) if (ids[i][0] === p.sub) return json_({ ok: true, duplicate: true });
    var now = new Date();
    var pct = p.possible ? Math.round(100 * p.score / p.possible) : 0;
    at.appendRow([now, p.aid, p.title, p.last, p.first, p.period, p.score, p.possible, pct, p.secs, p.sub, JSON.stringify(p)]);
    var it = sheet_('Items', ITEM_HEAD);
    var rows = p.items.map(function (x) {
      return [now, p.aid, p.last, p.first, p.period, x.id, x.std, x.dok, x.t, x.e, x.p, JSON.stringify(x.r), (x.tg || []).join(', ')];
    });
    if (rows.length) it.getRange(it.getLastRow() + 1, 1, rows.length, ITEM_HEAD.length).setValues(rows);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { }
  }
}

function doGet(e) {
  var q = (e && e.parameter) || {};
  try {
    if (q.action === 'ping') return json_({ ok: true, pong: true });
    var pass = PropertiesService.getScriptProperties().getProperty('TEACHER_PASSCODE');
    if (!pass) return json_({ ok: false, error: 'Set a TEACHER_PASSCODE script property first (README step 3).' });
    if (q.pass !== pass) return json_({ ok: false, error: 'Wrong passcode.' });
    var at = sheet_('Attempts', ATTEMPT_HEAD);
    var n = at.getLastRow() - 1;
    var data = n > 0 ? at.getRange(2, 1, n, ATTEMPT_HEAD.length).getValues() : [];
    if (q.action === 'list') {
      var g = {};
      data.forEach(function (r) {
        var x = g[r[1]] || (g[r[1]] = { aid: r[1], title: r[2], n: 0, last: '' });
        x.n++;
        var t = new Date(r[0]).toISOString();
        if (t > x.last) x.last = t;
      });
      return json_({ ok: true, assessments: Object.keys(g).map(function (k) { return g[k]; }) });
    }
    if (q.action === 'results') {
      var out = [];
      data.forEach(function (r) {
        if (r[1] === q.aid) { try { out.push(JSON.parse(r[11])); } catch (e3) { } }
      });
      return json_({ ok: true, attempts: out });
    }
    return json_({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
