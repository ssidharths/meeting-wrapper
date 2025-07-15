const express = require('express');
const router = express.Router();
const db = require('../db/db');
const logger = require('../utils/logger');

// Confirmation page before actual join
router.get('/:webinar_id/:attendee_email', async (req, res) => {
  const { webinar_id, attendee_email } = req.params;
  try {
    const result = await db.get(`SELECT attendee_link, name FROM webinars WHERE id = ?`, [webinar_id]);
    if (!result || !result.attendee_link) return res.status(404).send('Webinar link not found');

    // Render a basic HTML confirmation page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Join Webinar</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 50px; }
          button { font-size: 16px; padding: 10px 20px; cursor: pointer; background: #4f46e5; color: white; border: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h2>You're about to join the webinar:</h2>
        <h3>${result.name}</h3>
        <p>Click the button below to continue</p>
        <form method="POST" action="/api/v1/join/confirm">
          <input type="hidden" name="webinar_id" value="${webinar_id}" />
          <input type="hidden" name="attendee_email" value="${attendee_email}" />
          <input type="hidden" name="redirect" value="${result.attendee_link}" />
          <button type="submit">Join Webinar</button>
        </form>
      </body>
      </html>
    `);
  } catch (err) {
logger.error(err)    
res.status(500).send('Failed to load join page');
  }
});

// POST confirmation join handler
router.post('/confirm', express.urlencoded({ extended: true }), async (req, res) => {
  const { webinar_id, attendee_email, redirect } = req.body;
  if (!webinar_id || !attendee_email || !redirect) return res.status(400).send('Missing fields');

  try {
    const timestamp = new Date().toISOString();
    await db.run(
      `INSERT INTO attendance_tracking (webinar_id, attendee_email, login_time)
       VALUES (?, ?, ?)`,
      [webinar_id, attendee_email, timestamp]
    );
    res.redirect(redirect);
  } catch (err) {
    logger.error(err)    
    res.status(500).send('Unable to redirect to webinar');
  }
});

module.exports = router