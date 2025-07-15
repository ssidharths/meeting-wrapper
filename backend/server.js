const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const fileUpload = require('./routes/excelUpload');
const scheduleWebinars = require('./routes/scheduleWebinar');
const sendReminder = require('./routes/sendReminder');
const webinarTracking = require('./routes/trackAttendance');
const reportGeneration = require('./routes/generateAttendanceReport');
const { init } = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Serve static frontend from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Optional: fallback route for frontend routing (if using SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ API Routes
app.use('/api/v1/upload', fileUpload);
app.use('/api/v1/schedule', scheduleWebinars);
app.use('/api/v1/reminder', sendReminder);
app.use('/api/v1/join', webinarTracking);
app.use('/api/v1/attendance', reportGeneration);

// ✅ Start server after DB is ready
init().then(() => {
  console.log('Database initialized');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
