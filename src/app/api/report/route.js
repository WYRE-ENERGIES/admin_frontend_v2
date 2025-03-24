import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import path from 'path';
import { renderToString } from 'react-dom/server';
import Report from '@/Pages/AuthPages/Report';

// Chart.js configuration for server-side rendering
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

export async function POST(req) {
  try {
    const { emails, month, year, branch_name, report_data } = await req.json();

    // Generate the HTML content with the Report component
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            ${getStyles()}
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

    // Launch Puppeteer with specific configurations
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    
    // Set content and wait for charts to render
    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0']
    });

    await page.emulateMediaType('screen');

    // Generate PDF with specific settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      path: path.join(process.cwd(), 'public', 'reports', `report-${month}-${year}.pdf`)
    });

    await browser.close();

    // Send emails if provided
    if (emails && emails.length > 0) {
      await sendEmails(emails, pdf, month, year, branch_name);
    }

    // Return PDF
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=report-${month}-${year}.pdf`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

async function sendEmails(emails, pdf, month, year, branchName) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailPromises = emails.map(email => 
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Energy Report - ${branchName} - ${month}/${year}`,
      text: `Please find attached the energy report for ${branchName} for ${month}/${year}`,
      attachments: [{
        filename: `report-${month}-${year}.pdf`,
        content: pdf
      }]
    })
  );

  await Promise.all(mailPromises);
}

function getStyles() {
  return `
    body {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
      padding: 20px;
      background: white;
    }

    /* Copy your report.css styles here */
    ${fs.readFileSync(path.join(process.cwd(), 'src/report.css'), 'utf8')}
  `;
} 