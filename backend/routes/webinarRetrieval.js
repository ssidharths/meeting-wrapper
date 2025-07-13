app.get('/api/webinars', (req, res) => {
    db.all(`SELECT * FROM webinars ORDER BY date ASC`, (err, webinars) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // Get attendees for each webinar
      const promises = webinars.map(webinar => {
        return new Promise((resolve) => {
          db.all(`SELECT * FROM attendees WHERE webinar_id = ?`, [webinar.id], (err, attendees) => {
            resolve({ ...webinar, attendees: attendees || [] });
          });
        });
      });
  
      Promise.all(promises).then(results => {
        res.json(results);
      });
    });
  });