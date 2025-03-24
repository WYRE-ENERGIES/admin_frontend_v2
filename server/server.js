import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Report from '../src/Pages/AuthPages/Report.js';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '5mb' }));
app.use(express.static('public'));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_ACTIVE_API_KEY,
  url: 'https://api.mailgun.net'
});

app.post('/api/report', async (req, res) => {
  try {
    const { emails, month, year, branch_name, report_data } = req.body;

    // Generate HTML content with the rendered React component
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            ${fs.readFileSync(path.join(__dirname, '../src/report.css'), 'utf8')}
          </style>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
        </head>
        <body>
          <div id="report">
            ${renderToString(
              <Report 
                reportData={report_data}
                month={month}
                year={year}
                branchName={branch_name}
              />
            )}
          </div>
        </body>
      </html>
    `;

    // Save HTML content temporarily
    const tempHtmlPath = path.join(__dirname, 'temp', `report-${month}-${year}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: ['load', 'networkidle0']
    });

    // Wait for charts to render
    await page.evaluate(() => {
      return new Promise(resolve => {
        const checkCharts = () => {
          const charts = document.querySelectorAll('canvas');
          const allChartsReady = Array.from(charts).every(canvas => 
            canvas.getContext('2d') && canvas.__chartjs
          );
          if (allChartsReady) {
            resolve();
          } else {
            setTimeout(checkCharts, 100);
          }
        };
        checkCharts();
      });
    });

    // Generate PDF
    const pdfPath = path.join(__dirname, 'public', 'reports', `report-${month}-${year}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Clean up temp HTML file
    fs.unlinkSync(tempHtmlPath);

    // Send emails if provided
    if (emails && emails.length > 0) {
      await sendEmails(emails, pdfPath, month, year, branch_name);
    }

    // Send PDF file
    res.download(pdfPath);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

async function sendEmails(emails, pdfPath, month, year, branchName) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    const mailPromises = emails.map(email => 
      mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.MAIL_GUN_SENDER,
        to: email,
        subject: `Energy Report - ${branchName} - ${month}/${year}`,
        text: `Please find attached the energy report for ${branchName} for ${month}/${year}`,
        attachment: {
          data: pdfBuffer,
          filename: `report-${month}-${year}.pdf`
        }
      })
    );

    await Promise.all(mailPromises);
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 