const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.post('/', async (req, res) => {
    try {
        const webinars = await db.all(`
            SELECT * FROM webinars
            WHERE attendee_link IS NULL OR TRIM(attendee_link) = ''
               OR presenter_link IS NULL OR TRIM(presenter_link) = ''
          `);  
      for (const webinar of webinars) {
        const attendeeLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`;
        const presenterLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}?presenter=true`;
  
        await db.run(`UPDATE webinars SET attendee_link = ?, presenter_link = ? WHERE id = ?`,
          [attendeeLink, presenterLink, webinar.id]
        );
      }
  
      const updated = await db.all(`
        SELECT w.*, a.name AS attendee_name, a.email AS attendee_email, a.phone AS attendee_phone
        FROM webinars w
        LEFT JOIN attendees a ON w.id = a.webinar_id
      `);
  
      const webinarMap = new Map();
      updated.forEach(row => {
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
            attendees: [],
            status: row.attendee_link || row.presenter_link ? 'scheduled' : 'pending'
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

      console.log(JSON.stringify(Array.from(webinarMap.values()), null, 2));
      res.json({ webinars: Array.from(webinarMap.values()) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to schedule webinars' });
    }
});

router.post('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const attendeeLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`;
      const presenterLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}?presenter=true`;
  
      await db.run(`UPDATE webinars SET attendee_link = ?, presenter_link = ? WHERE id = ?`,
        [attendeeLink, presenterLink, id]
      );
  
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
            attendees: [],
            status: row.attendee_link || row.presenter_link ? 'scheduled' : 'pending'
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
      res.status(500).json({ error: 'Failed to schedule webinar' });
    }
  });
  
module.exports = router;