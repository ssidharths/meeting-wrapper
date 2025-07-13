const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));