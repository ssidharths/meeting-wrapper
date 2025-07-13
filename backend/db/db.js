const db = new sqlite3.Database('webinars.db');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS webinars (
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

  db.run(`CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webinar_id) REFERENCES webinars (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendance_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id TEXT,
    attendee_email TEXT,
    login_time DATETIME,
    logout_time DATETIME,
    duration_minutes INTEGER,
    FOREIGN KEY (webinar_id) REFERENCES webinars (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reminders (
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
});