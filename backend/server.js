const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('./routes/excelUpload')
const scheduleWebinars = require('./routes/scheduleWebinar')
const sendReminder = require('./routes/sendReminder')
const webinarTracking = require('./routes/trackAttendance')
const reportGeneration = require('./routes/generateAttendanceReport')
const {init} = require('./db/db')
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const PORT = process.env.PORT || 3000;
init().then(() => {
    console.log('Database initialized');
    // Mount routes after DB is ready
    app.use('/api/v1/upload', fileUpload);
    app.use('/api/v1/schedule',scheduleWebinars)
    app.use('/api/v1/reminder',sendReminder)
    app.use('/api/v1/join', webinarTracking )
    app.use('/api/v1/attendance',reportGeneration)
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });