import { schedule } from 'node-cron';

schedule('0 9 * * *', () => {
    // Check for webinars in next 24 hours and send reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    db.all(`SELECT * FROM webinars WHERE date = ?`, [tomorrowStr], (err, webinars) => {
      if (err) return;
      
      webinars.forEach(webinar => {
        // Send 24-hour reminder
        fetch('http://localhost:3001/api/send-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webinar_id: webinar.id,
            reminder_type: '24h'
          })
        });
      });
    });
  });