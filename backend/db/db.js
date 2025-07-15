const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.resolve(__dirname, '../webinars.db');

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // `this` = context of sqlite3 with lastID, changes
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}


// Initialize database tables
async function init(){
  await run (`CREATE TABLE IF NOT EXISTS webinars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER,
    description TEXT,
    presenter_name TEXT,
    presenter_email TEXT,
    presenter_phone TEXT,
    attendee_link TEXT,
    presenter_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webinar_id) REFERENCES webinars (id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS attendance_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id TEXT,
    attendee_email TEXT,
    login_time DATETIME,
    logout_time DATETIME,
    duration_minutes INTEGER,
    FOREIGN KEY (webinar_id) REFERENCES webinars (id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    reminder_type TEXT, -- 'email' or 'whatsapp'
    reminder_time TEXT, -- '24h', '1h', etc.
    sent_at DATETIME,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (webinar_id) REFERENCES webinars (id)
  )`);
};

module.exports = {
  db,
  init,
  run,
  all,
  get,
};