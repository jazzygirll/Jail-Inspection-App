require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inspection.db');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create the reports table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspector_name TEXT,
    inspector_email TEXT,
    location TEXT,
    date TEXT,
    report_data TEXT
  )
`);

// Route to handle form submission
app.post('/api/submit', (req, res) => {
  const { inspectorName, inspectorEmail, location, date, questions } = req.body;
  const reportData = JSON.stringify(questions);

  db.run(
    `INSERT INTO reports (inspector_name, inspector_email, location, date, report_data)
     VALUES (?, ?, ?, ?, ?)`,
    [inspectorName, inspectorEmail, location, date, reportData],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error saving report.');
      }

      const reportId = this.lastID;
      generateAndSendPDF(inspectorName, inspectorEmail, location, date, questions, reportId);
      res.send({ success: true, id: reportId });
    }
  );
});

// Route to get all reports
app.get('/api/reports', (req, res) => {
  db.all(`SELECT id, inspector_name, inspector_email, location, date FROM reports ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error fetching reports.');
    }
    res.json(rows);
  });
});

// Route to get the details of one report by ID
app.get('/api/report/:id', (req, res) => {
  db.get(`SELECT * FROM reports WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error fetching report.');
    }
    if (row) {
      row.questions = JSON.parse(row.report_data);
    }
    res.json(row);
  });
});

// Route to generate and send the PDF for download
app.get('/api/report/:id/pdf', (req, res) => {
    const reportId = req.params.id;
  
    db.get(`SELECT * FROM reports WHERE id = ?`, [reportId], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error generating PDF.');
      }
  
      if (!row) {
        return res.status(404).send('Report not found.');
      }
  
      const questions = JSON.parse(row.report_data);
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="InspectionReport-${reportId}.pdf"`);
  
      doc.pipe(res);
  
      // ✅ PDF Content
      doc.fontSize(18).text('Jail Inspection Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Inspector: ${row.inspector_name}`);
      doc.text(`Email: ${row.inspector_email}`);
      doc.text(`Location: ${row.location}`);
      doc.text(`Date: ${row.date}`);
      doc.moveDown();
  
      questions.forEach(q => {
        doc.text(`Area: ${q.area}`);
        doc.text(`Question: ${q.question}`);
        doc.text(`Status: ${q.status}`);
        doc.text(`Notes: ${q.notes || 'N/A'}`);
        doc.moveDown();
      });
  
      doc.end();
    });
  });
  

// Function to generate PDF and send email
function generateAndSendPDF(name, email, location, date, questions, reportId) {
  const doc = new PDFDocument();
  const filePath = `./report-${reportId}.pdf`;
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('Jail Inspection Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Inspector: ${name}`);
  doc.text(`Email: ${email}`);
  doc.text(`Location: ${location}`);
  doc.text(`Date: ${date}`);
  doc.moveDown();

  questions.forEach(q => {
    doc.text(`Area: ${q.area}`);
    doc.text(`Question: ${q.question}`);
    doc.text(`Status: ${q.status}`);
    doc.text(`Notes: ${q.notes || 'N/A'}`);
    doc.moveDown();
  });

  doc.end();

  stream.on('finish', () => {
    const msg = {
      to: email,
      from: 'jazmineah94@gmail.com',
      subject: 'Your Jail Inspection Report',
      text: 'Attached is your inspection report PDF.',
      attachments: [{
        content: fs.readFileSync(filePath).toString('base64'),
        filename: `InspectionReport-${reportId}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    };

    sgMail.send(msg)
      .then(() => {
        console.log('✅ Email sent successfully!');
        fs.unlinkSync(filePath);
      })
      .catch(err => console.error('❌ Email error:', err));
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
