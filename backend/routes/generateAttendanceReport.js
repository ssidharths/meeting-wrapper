app.get('/api/attendance-report/:webinar_id', (req, res) => {
    const webinarId = req.params.webinar_id;
    
    db.all(`SELECT 
      at.attendee_email,
      a.name as attendee_name,
      at.login_time,
      at.logout_time,
      at.duration_minutes,
      w.name as webinar_name
      FROM attendance_tracking at
      JOIN attendees a ON at.attendee_email = a.email AND at.webinar_id = a.webinar_id
      JOIN webinars w ON at.webinar_id = w.id
      WHERE at.webinar_id = ?
      ORDER BY at.login_time DESC`, [webinarId], (err, report) => {
      
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(report);
    });
  });
  