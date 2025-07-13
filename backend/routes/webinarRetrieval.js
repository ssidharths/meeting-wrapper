// app.get('/api/webinars', (req, res) => {
//     db.all(`SELECT * FROM webinars ORDER BY date ASC`, (err, webinars) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
  
//       // Get attendees for each webinar
//       const promises = webinars.map(webinar => {
//         return new Promise((resolve) => {
//           db.all(`SELECT * FROM attendees WHERE webinar_id = ?`, [webinar.id], (err, attendees) => {
//             resolve({ ...webinar, attendees: attendees || [] });
//           });
//         });
//       });
  
//       Promise.all(promises).then(results => {
//         res.json(results);
//       });
//     });
//   });

const express = require('express');
const router = express.Router();
const db = require('../db/db');


// GET route to fetch all webinars and attendees
router.get('/', async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT w.*, a.name AS attendee_name, a.email AS attendee_email, a.phone AS attendee_phone
        FROM webinars w
        LEFT JOIN attendees a ON w.id = a.webinar_id
      `);
  
      const webinarMap = new Map();
      rows.forEach(row => {
        if (!webinarMap.has(row.id)) {
          webinarMap.set(row.id, {
            webinar_id: row.id,
            name: row.name,
            date: row.date,
            time: row.time,
            duration: row.duration,
            description: row.description,
            presenter_name: row.presenter_name,
            presenter_email: row.presenter_email,
            presenter_phone: row.presenter_phone,
            attendee_link: row.attendee_link,
            presenter_link: row.presenter_link,
            attendees: []
          });
        }
        if (row.attendee_email) {
          webinarMap.get(row.id).attendees.push({
            name: row.attendee_name,
            email: row.attendee_email,
            phone: row.attendee_phone
          });
        }
      });
  
      res.json({ webinars: Array.from(webinarMap.values()) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch webinars' });
    }
  });

  module.exports = router;
