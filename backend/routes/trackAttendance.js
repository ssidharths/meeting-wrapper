app.post('/api/track-attendance', (req, res) => {
    const { webinar_id, attendee_email, action } = req.body;
    
    if (action === 'login') {
      db.run(`INSERT INTO attendance_tracking (webinar_id, attendee_email, login_time) VALUES (?, ?, datetime('now'))`,
        [webinar_id, attendee_email]);
    } else if (action === 'logout') {
      db.run(`UPDATE attendance_tracking 
        SET logout_time = datetime('now'), 
            duration_minutes = (strftime('%s', 'now') - strftime('%s', login_time)) / 60
        WHERE webinar_id = ? AND attendee_email = ? AND logout_time IS NULL`,
        [webinar_id, attendee_email]);
    }
    
    res.json({ message: 'Attendance tracked successfully' });
  });