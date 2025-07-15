// routes/webinarRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUploadConfig');
const db = require('../db/db');
const { processExcelFile } = require('../utils/excelProcessor');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

router.post('/', upload.single('excel'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const data = processExcelFile(req.file.path);
    const webinars = new Map();

    data.forEach(row => {
      const id = row.webinar_id || uuidv4();
      if (!webinars.has(id)) {
        webinars.set(id, {
          ...row,
          webinar_id: id,
          attendees: []
        });
      }
      if (row.attendee_email) {
        webinars.get(id).attendees.push({
          name: row.attendee_name,
          email: row.attendee_email,
          phone: row.attendee_phone
        });
      }
    });

    for (const [id, webinar] of webinars.entries()) {
      await db.run(`INSERT OR REPLACE INTO webinars 
        (id, name, date, time, duration, description, presenter_name, presenter_email, presenter_phone, attendee_link, presenter_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, webinar.name, webinar.date, webinar.time, webinar.duration, webinar.description,
        webinar.presenter_name, webinar.presenter_email, webinar.presenter_phone, '', '']
      );

      for (const attendee of webinar.attendees) {
        await db.run(`INSERT INTO attendees (webinar_id, name, email, phone) VALUES (?, ?, ?, ?)`,
          [id, attendee.name, attendee.email, attendee.phone]
        );
      }
    }

    res.json({
      message: 'Excel uploaded and webinars saved',
      webinars: Array.from(webinars.values())
    });
  } catch (err) {
    logger.error(err)
    res.status(500).json({ error: 'Failed to process Excel' });
  }
});

module.exports = router;
