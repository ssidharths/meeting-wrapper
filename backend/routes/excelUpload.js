app.post('/api/upload-excel', upload.single('excel'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    try {
      const webinarData = processExcelFile(req.file.path);
      const webinars = new Map();
      
      // Group data by webinar
      webinarData.forEach(row => {
        if (!webinars.has(row.webinar_id)) {
          const links = generateWebinarLinks(row.webinar_id);
          webinars.set(row.webinar_id, {
            ...row,
            ...links,
            attendees: []
          });
        }
        
        if (row.attendee_email) {
          webinars.get(row.webinar_id).attendees.push({
            name: row.attendee_name,
            email: row.attendee_email,
            phone: row.attendee_phone
          });
        }
      });
  
      // Save to database
      webinars.forEach((webinar, webinarId) => {
        // Insert webinar
        db.run(`INSERT OR REPLACE INTO webinars 
          (id, name, date, time, duration, description, presenter_name, presenter_email, presenter_phone, attendee_link, presenter_link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [webinarId, webinar.name, webinar.date, webinar.time, webinar.duration, webinar.description,
           webinar.presenter_name, webinar.presenter_email, webinar.presenter_phone,
           webinar.attendee_link, webinar.presenter_link]);
  
        // Insert attendees
        webinar.attendees.forEach(attendee => {
          db.run(`INSERT INTO attendees (webinar_id, name, email, phone) VALUES (?, ?, ?, ?)`,
            [webinarId, attendee.name, attendee.email, attendee.phone]);
        });
      });
  
      res.json({ 
        message: 'Excel file processed successfully',
        webinars: Array.from(webinars.values())
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ error: 'Failed to process Excel file' });
    }
  });
  