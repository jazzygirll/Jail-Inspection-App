# Jail Inspection App 🚓✨

A full-stack, progressive web app (PWA) designed to streamline jail inspection reporting, ensure documentation integrity, and simplify the emailing and archiving of reports.

Deployed LIVE at: [https://jail-inspection-app-production.up.railway.app](https://jail-inspection-app-production.up.railway.app)

---

## 🚀 Features

- 📋 Dynamic inspection form with location-specific questions
- ✅ Pass/Fail with **required notes** on failures
- 📥 Submit reports with real-time loading spinner and SweetAlert feedback
- 📧 Automated email submission (PDF report attached) using SendGrid
- 📑 View submitted reports in an organized, mobile-friendly table
- 📄 Download any report as a PDF
- 📱 Fully PWA-enabled — users can install app on mobile devices!
- 🎨 Clean, polished responsive UI optimized for mobile and desktop

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript, SweetAlert2
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via sqlite3 package)
- **Email Service:** SendGrid
- **PDF Generation:** PDFKit
- **Deployment:** Railway
- **Progressive Web App:** Manifest.json + Service Worker

---

## 📂 Project Structure
/backend 
 ├── server.js          # Express server handling API and frontend routes 
 ├── inspection.db      # SQLite database 
 ├── .env               # Environment variables (ignored by Git) 
 └── /public 
   ├── index.html           # Main inspection form 
   ├── view-reports.html    # View reports dashboard 
   ├── app.js               # Frontend JS for form behavior 
   ├── view-reports.js      # Frontend JS for reports behavior
   ├── styles.css           # App styling 
   ├── manifest.json        # PWA manifest 
   ├── service-worker.js    # PWA service worker 
   ├── icon-192.png         # PWA app icon 
   └── icon-512.png         # PWA app icon



---

## ⚙️ Environment Variables

Required `.env` configuration:

```bash
SENDGRID_API_KEY=your-sendgrid-api-key-here
PORT=3000

