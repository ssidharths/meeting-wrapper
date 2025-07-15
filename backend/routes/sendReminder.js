const express = require('express');
const router = express.Router();
const db = require('../db/db');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP_FROM;
const client = twilio(TWILIO_SID, TWILIO_AUTH);

router.post('/email', async (req, res) => {
    try {
        console.log("Inside email");
        
      const webinars = await db.all(`
        SELECT w.*, a.name AS attendee_name, a.email AS attendee_email
        FROM webinars w
        LEFT JOIN attendees a ON w.id = a.webinar_id
        WHERE w.attendee_link IS NOT NULL AND w.attendee_link != ''
          AND w.presenter_link IS NOT NULL AND w.presenter_link != ''
      `);
  
      const webinarMap = new Map();
      webinars.forEach(row => {
        if (!webinarMap.has(row.id)) {
          webinarMap.set(row.id, {
            webinar_id: row.id,
            name: row.name,
            date: row.date,
            time: row.time,
            presenter_name: row.presenter_name,
            presenter_email: row.presenter_email,
            presenter_link: row.presenter_link,
            attendee_link: row.attendee_link,
            attendees: []
          });
        }
        if (row.attendee_email) {
          webinarMap.get(row.id).attendees.push({
            name: row.attendee_name,
            email: row.attendee_email
          });
        }
      });
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const results = [];
  
      for (const webinar of webinarMap.values()) {
        for (const attendee of webinar.attendees) {
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
  
          await transporter.sendMail(mailOptions);
          results.push(attendee.email);
        }
  
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
            <p>Total registered attendees: ${webinar.attendees.length}</p>
          `
        };
  
        await transporter.sendMail(presenterMailOptions);
        results.push(webinar.presenter_email);
      }
  
      res.json({ message: 'Email reminders sent', sent: results.length });
    } catch (err) {
      console.error('Failed to send emails', err);
      res.status(500).json({ error: 'Failed to send email reminders' });
    }
  });

  router.post('/whatsapp', async (req, res) => {
    try {
      const webinars = await db.all(`
        SELECT w.*, a.name AS attendee_name, a.phone AS attendee_phone
        FROM webinars w
        LEFT JOIN attendees a ON w.id = a.webinar_id
        WHERE w.attendee_link IS NOT NULL AND w.attendee_link != ''
          AND w.presenter_link IS NOT NULL AND w.presenter_link != ''
      `);
  
      const webinarMap = new Map();
      webinars.forEach(row => {
        if (!webinarMap.has(row.id)) {
          webinarMap.set(row.id, {
            webinar_id: row.id,
            name: row.name,
            date: row.date,
            time: row.time,
            presenter_name: row.presenter_name,
            presenter_phone: row.presenter_phone,
            presenter_link: row.presenter_link,
            attendee_link: row.attendee_link,
            attendees: []
          });
        }
        if (row.attendee_phone) {
          webinarMap.get(row.id).attendees.push({
            name: row.attendee_name,
            phone: row.attendee_phone
          });
        }
      });
  
      const results = [];
  
      for (const webinar of webinarMap.values()) {
        // Send to attendees
        for (const attendee of webinar.attendees) {
          const message = `Hi ${attendee.name}, reminder: "${webinar.name}" on ${webinar.date} at ${webinar.time}. Join: ${webinar.attendee_link}`;
          console.log(attendee.phone);
          
          const status = await sendWhatsApp(attendee.phone, message);
          results.push({ phone: attendee.phone, status });
        }
  
        // Send to presenter
        if (webinar.presenter_phone) {
          const message = `Hi ${webinar.presenter_name}, you are presenting "${webinar.name}" on ${webinar.date} at ${webinar.time}. Join: ${webinar.presenter_link}`;
          const status = await sendWhatsApp(webinar.presenter_phone, message);
          results.push({ phone: webinar.presenter_phone, status });
        }
      }
  
      res.json({ message: 'WhatsApp reminders sent', sent: results.length });
    } catch (err) {
      console.error('Failed to send WhatsApp messages', err);
      res.status(500).json({ error: 'Failed to send WhatsApp reminders' });
    }
  });
  
  async function sendWhatsApp(phone, body) {
    try {
      const msg = await client.messages.create({
        from: `whatsapp:${TWILIO_WHATSAPP}`,
        to: `whatsapp:${phone}`,
        body
      });
      return msg.sid;
    } catch (err) {
      console.error(`WhatsApp error for ${phone}:`, err);
      return 'failed';
    }
  }

  module.exports = router;