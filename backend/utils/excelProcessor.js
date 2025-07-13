import { readFile, utils } from 'xlsx';
const { v4: uuidv4 } = require('uuid');

function processExcelFile(filePath) {
    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet);
    
    return data.map(row => ({
      webinar_id: row['Webinar ID'] || uuidv4(),
      name: row['Webinar Name'] || row['Name'],
      date: row['Date'],
      time: row['Time'],
      duration: row['Duration'] || 60,
      description: row['Description'] || '',
      presenter_name: row['Presenter Name'],
      presenter_email: row['Presenter Email'],
      presenter_phone: row['Presenter Phone'],
      attendee_name: row['Attendee Name'],
      attendee_email: row['Attendee Email'],
      attendee_phone: row['Attendee Phone']
    }));
  }