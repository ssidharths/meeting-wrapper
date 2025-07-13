app.post('/api/send-reminders', (req, res) => {
    const { webinar_id, reminder_type } = req.body;
    
    db.get(`SELECT * FROM webinars WHERE id = ?`, [webinar_id], (err, webinar) => {
      if (err || !webinar) {
        return res.status(404).json({ error: 'Webinar not found' });
      }
      
      db.all(`SELECT * FROM attendees WHERE webinar_id = ?`, [webinar_id], (err, attendees) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Send emails to attendees
        attendees.forEach(attendee => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: attendee.email,
            subject: `Reminder: ${webinar.name}`,
            html: `
              <h2>Webinar Reminder</h2>
              <p>Hello ${attendee.name},</p>
              <p>This is a reminder for the upcoming webinar: <strong>${webinar.name}</strong></p>
              <p><strong>Date:</strong> ${webinar.date}</p>
              <p><strong>Time:</strong> ${webinar.time}</p>
              <p><strong>Join Link:</strong> <a href="${webinar.attendee_link}">Click here to join</a></p>
              <p>See you there!</p>
            `
          };
          
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        });
        
        // Send email to presenter
        const presenterMailOptions = {
          from: process.env.EMAIL_USER,
          to: webinar.presenter_email,
          subject: `Presenter Reminder: ${webinar.name}`,
          html: `
            <h2>Presenter Reminder</h2>
            <p>Hello ${webinar.presenter_name},</p>
            <p>This is a reminder for your upcoming webinar: <strong>${webinar.name}</strong></p>
            <p><strong>Date:</strong> ${webinar.date}</p>
            <p><strong>Time:</strong> ${webinar.time}</p>
            <p><strong>Presenter Link:</strong> <a href="${webinar.presenter_link}">Click here to join as presenter</a></p>
            <p>Total registered attendees: ${attendees.length}</p>
          `
        };
        
        transporter.sendMail(presenterMailOptions);
        
        res.json({ message: 'Reminders sent successfully' });
      });
    });
  });