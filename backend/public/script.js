
// Global variables
let webinars = [];
let attendanceTracking = {};

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showNotification('Please select an Excel file (.xlsx or .xls)', 'error');
        return;
    }

    showProgress(0);
    document.getElementById('progressBar').classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            showProgress(50);
            parseWebinarData(jsonData);
            showProgress(100);

            setTimeout(() => {
                document.getElementById('progressBar').classList.add('hidden');
                showNotification('File uploaded successfully!', 'success');
            }, 500);

        } catch (error) {
            showNotification('Error processing file: ' + error.message, 'error');
            document.getElementById('progressBar').classList.add('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseWebinarData(data) {
    const webinarMap = new Map();

    data.forEach(row => {
        const webinarId = row['Webinar ID'] || row['webinar_id'] || row['id'];
        const webinarName = row['Webinar Name'] || row['webinar_name'] || row['name'];
        const date = row['Date'] || row['date'];
        const time = row['Time'] || row['time'];
        const presenterName = row['Presenter Name'] || row['presenter_name'];
        const presenterEmail = row['Presenter Email'] || row['presenter_email'];
        const presenterPhone = row['Presenter Phone'] || row['presenter_phone'];
        const attendeeName = row['Attendee Name'] || row['attendee_name'];
        const attendeeEmail = row['Attendee Email'] || row['attendee_email'];
        const attendeePhone = row['Attendee Phone'] || row['attendee_phone'];

        if (!webinarMap.has(webinarId)) {
            webinarMap.set(webinarId, {
                id: webinarId,
                name: webinarName,
                date: date,
                time: time,
                presenter: {
                    name: presenterName,
                    email: presenterEmail,
                    phone: presenterPhone
                },
                attendees: [],
                status: 'pending',
                links: {
                    zoom: null,
                    googlemeet: null,
                    presenter: null,
                    attendee: null
                }
            });
        }

        if (attendeeName && attendeeEmail) {
            webinarMap.get(webinarId).attendees.push({
                name: attendeeName,
                email: attendeeEmail,
                phone: attendeePhone
            });
        }
    });

    webinars = Array.from(webinarMap.values());
    updateUI();
}

function updateUI() {
    updateStatistics();
    updateWebinarsTable();
    showSections();
}

function showSections() {
    document.getElementById('statsSection').classList.remove('hidden');
    document.getElementById('controlsSection').classList.remove('hidden');
    document.getElementById('webinarsSection').classList.remove('hidden');
}

function updateStatistics() {
    const total = webinars.length;
    const scheduled = webinars.filter(w => w.status === 'scheduled').length;
    const totalAttendees = webinars.reduce((sum, w) => sum + w.attendees.length, 0);
    const upcoming = webinars.filter(w => new Date(w.date) > new Date()).length;

    document.getElementById('totalWebinars').textContent = total;
    document.getElementById('scheduledWebinars').textContent = scheduled;
    document.getElementById('totalAttendees').textContent = totalAttendees;
    document.getElementById('upcomingWebinars').textContent = upcoming;
}

function updateWebinarsTable() {
    const tbody = document.getElementById('webinarsTableBody');
    tbody.innerHTML = '';

    webinars.forEach(webinar => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${webinar.id}</td>
            <td>${webinar.name}</td>
            <td>${webinar.date} ${webinar.time}</td>
            <td>${webinar.presenter.name}<br><small>${webinar.presenter.email}</small></td>
            <td>${webinar.attendees.length} attendees</td>
            <td><span class="status ${webinar.status}">${webinar.status.toUpperCase()}</span></td>
            <td>
                <div class="link-container">
                    ${webinar.links.zoom ? `<a href="${webinar.links.zoom}" class="link-btn" target="_blank">🎥 Zoom</a>` : ''}
                    ${webinar.links.googlemeet ? `<a href="${webinar.links.googlemeet}" class="link-btn" target="_blank">📹 Meet</a>` : ''}
                    ${webinar.links.presenter ? `<a href="${webinar.links.presenter}" class="link-btn" target="_blank">👨‍💼 Presenter</a>` : ''}
                    ${webinar.links.attendee ? `<a href="${webinar.links.attendee}" class="link-btn" target="_blank">👥 Attendee</a>` : ''}
                </div>
            </td>
            <td>
                <button class="btn" onclick="viewWebinarDetails('${webinar.id}')" style="font-size: 0.8em; padding: 5px 10px;">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Button event handlers
document.getElementById('scheduleAllBtn').addEventListener('click', scheduleAllWebinars);
document.getElementById('sendEmailsBtn').addEventListener('click', sendEmailReminders);
document.getElementById('sendWhatsAppBtn').addEventListener('click', sendWhatsAppReminders);
document.getElementById('generateReportBtn').addEventListener('click', generateReport);

function scheduleAllWebinars() {
    let scheduled = 0;
    webinars.forEach(webinar => {
        if (webinar.status === 'pending') {
            // Simulate scheduling with different platforms
            const platform = Math.random() > 0.5 ? 'zoom' : 'googlemeet';
            webinar.status = 'scheduled';
            
            if (platform === 'zoom') {
                webinar.links.zoom = `https://zoom.us/j/${Math.random().toString().substr(2, 10)}`;
                webinar.links.presenter = `https://zoom.us/j/${Math.random().toString().substr(2, 10)}?pwd=presenter`;
                webinar.links.attendee = `https://zoom.us/j/${Math.random().toString().substr(2, 10)}?pwd=attendee`;
            } else {
                webinar.links.googlemeet = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`;
                webinar.links.presenter = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}?presenter=true`;
                webinar.links.attendee = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}?attendee=true`;
            }
            scheduled++;
        }
    });
    
    updateUI();
    showNotification(`${scheduled} webinars scheduled successfully!`, 'success');
}

function sendEmailReminders() {
    let emailsSent = 0;
    webinars.forEach(webinar => {
        if (webinar.status === 'scheduled') {
            // Simulate sending emails
            emailsSent += 1 + webinar.attendees.length; // 1 presenter + attendees
        }
    });
    
    showNotification(`${emailsSent} email reminders sent!`, 'success');
}

function sendWhatsAppReminders() {
    let whatsappSent = 0;
    webinars.forEach(webinar => {
        if (webinar.status === 'scheduled') {
            // Simulate sending WhatsApp messages
            whatsappSent += webinar.attendees.filter(a => a.phone).length;
            if (webinar.presenter.phone) whatsappSent++;
        }
    });
    
    showNotification(`${whatsappSent} WhatsApp reminders sent!`, 'success');
}

function generateReport() {
    // Simulate report generation
    const report = {
        totalWebinars: webinars.length,
        scheduledWebinars: webinars.filter(w => w.status === 'scheduled').length,
        totalAttendees: webinars.reduce((sum, w) => sum + w.attendees.length, 0),
        attendance: Math.floor(Math.random() * 80) + 20 // Random attendance 20-100%
    };
    
    const reportContent = `
        <h4>📊 Webinar Report</h4>
        <p><strong>Total Webinars:</strong> ${report.totalWebinars}</p>
        <p><strong>Scheduled:</strong> ${report.scheduledWebinars}</p>
        <p><strong>Total Attendees:</strong> ${report.totalAttendees}</p>
        <p><strong>Average Attendance:</strong> ${report.attendance}%</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    document.getElementById('webinarDetails').innerHTML = reportContent;
    document.getElementById('webinarModal').style.display = 'block';
}

function viewWebinarDetails(webinarId) {
    const webinar = webinars.find(w => w.id === webinarId);
    if (!webinar) return;

    const attendeesList = webinar.attendees.map(a => 
        `<li>${a.name} (${a.email}) ${a.phone ? `- ${a.phone}` : ''}</li>`
    ).join('');

    const details = `
        <h4>🎥 ${webinar.name}</h4>
        <p><strong>ID:</strong> ${webinar.id}</p>
        <p><strong>Date & Time:</strong> ${webinar.date} ${webinar.time}</p>
        <p><strong>Status:</strong> <span class="status ${webinar.status}">${webinar.status.toUpperCase()}</span></p>
        <p><strong>Presenter:</strong> ${webinar.presenter.name}</p>
        <p><strong>Email:</strong> ${webinar.presenter.email}</p>
        <p><strong>Phone:</strong> ${webinar.presenter.phone || 'N/A'}</p>
        <p><strong>Attendees (${webinar.attendees.length}):</strong></p>
        <ul style="margin-left: 20px; margin-top: 10px;">
            ${attendeesList}
        </ul>
        ${webinar.links.zoom || webinar.links.googlemeet ? `
            <p><strong>Meeting Links:</strong></p>
            <div style="margin-top: 10px;">
                ${webinar.links.zoom ? `<a href="${webinar.links.zoom}" class="link-btn" target="_blank">🎥 Zoom Link</a>` : ''}
                ${webinar.links.googlemeet ? `<a href="${webinar.links.googlemeet}" class="link-btn" target="_blank">📹 Google Meet</a>` : ''}
            </div>
        ` : ''}
    `;

    document.getElementById('webinarDetails').innerHTML = details;
    document.getElementById('webinarModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('webinarModal').style.display = 'none';
}

function showProgress(percentage) {
    document.getElementById('progressFill').style.width = percentage + '%';
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('webinarModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize the application
console.log('Webinar Management System initialized');