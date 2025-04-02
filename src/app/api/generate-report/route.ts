import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { traineeData, pitchImage } = await request.json();
    
    // Log the received data
    console.log('Received trainee data:', traineeData);
    console.log('Pitch image received:', !!pitchImage);

    // Read the EJS template
    const templatePath = path.join(process.cwd(), 'src/templates/report.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Log the template content
    console.log('Template content:', template);

    // Render the template with data
    const html = ejs.render(template, {
      traineeData,
      pitchImage
    });

    // Log the rendered HTML
    console.log('Rendered HTML:', html);

    // Launch Puppeteer with specific configuration for Next.js
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and content
    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(html);
    
    // Wait for images and fonts to load
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

    // Generate PDF
    const pdf = await page.pdf({
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

    // Return the PDF with proper headers
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="trainee-report-${traineeData.name}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
} 