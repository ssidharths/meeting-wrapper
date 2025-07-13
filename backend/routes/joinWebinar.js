app.get('/join/:webinar_id', (req, res) => {
    const webinarId = req.params.webinar_id;
    const role = req.query.role || 'attendee';
    
    db.get(`SELECT * FROM webinars WHERE id = ?`, [webinarId], (err, webinar) => {
      if (err || !webinar) {
        return res.status(404).send('Webinar not found');
      }
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Join Webinar: ${webinar.name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .webinar-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .join-btn { background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
            .role-badge { background: ${role === 'presenter' ? '#28a745' : '#17a2b8'}; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="webinar-info">
            <h1>${webinar.name}</h1>
            <p><strong>Date:</strong> ${webinar.date}</p>
            <p><strong>Time:</strong> ${webinar.time}</p>
            <p><strong>Presenter:</strong> ${webinar.presenter_name}</p>
            <p><span class="role-badge">Joining as: ${role.toUpperCase()}</span></p>
          </div>
          
          <div id="join-section">
            <h3>Ready to join?</h3>
            <p>Enter your email to join the webinar:</p>
            <input type="email" id="email" placeholder="your@email.com" style="padding: 10px; width: 200px; margin-right: 10px;">
            <button class="join-btn" onclick="joinWebinar()">Join Now</button>
          </div>
          
          <script>
            function joinWebinar() {
              const email = document.getElementById('email').value;
              if (!email) {
                alert('Please enter your email');
                return;
              }
              
              // Track attendance
              fetch('/api/track-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  webinar_id: '${webinarId}',
                  attendee_email: email,
                  action: 'login'
                })
              });
              
              // Redirect to actual webinar platform (replace with your webinar platform)
              alert('Joining webinar... (In production, this would redirect to your webinar platform)');
            }
          </script>
        </body>
        </html>
      `);
    });
  });
  