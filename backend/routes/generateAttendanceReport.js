const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { Parser } = require("json2csv");
const logger = require('../utils/logger');

router.get("/:webinar_id", async (req, res) => {
  try {
    const { webinar_id } = req.params;
    const rows = await db.all(
      `
  SELECT webinar_id, attendee_email, login_time, logout_time, duration_minutes
  FROM attendance_tracking
  WHERE webinar_id = ?
      `,
      [webinar_id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "No attendance data found." });
    }
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment(`attendance_${webinar_id}.csv`);
    res.send(csv);
  } catch (err) {
    logger.error('Error generating attendance report:', err);
    res.status(500).json({ error: "Failed to generate attendance report" });
  }
});

module.exports = router;
