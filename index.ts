import express from 'express';
import fs from 'fs';
import { glob } from 'glob';
import MarkdownIt from 'markdown-it';
import { AddressInfo } from 'net';
import path from 'path';
import puppeteer from 'puppeteer';

async function convertMarkdownToPdf(inputFile: string, outputFile: string) {
  const markdownContent = fs.readFileSync(inputFile, 'utf-8');
  const md = new MarkdownIt({ html: true });
  const htmlContent = md.render(markdownContent);

  // Save HTML content to a temporary file
  const tempHtmlFile = path.join(__dirname, 'temp.html');
  fs.writeFileSync(tempHtmlFile, htmlContent);

  // Set up Express.js server
  const app = express();
  app.use('/assets', express.static(path.join(__dirname, 'docs', 'assets')));
  app.get('/', (req, res) => res.sendFile(tempHtmlFile));

  // Start server
  const server = app.listen(0); // 0 to assign a random free port
  const port = (server.address() as AddressInfo).port;

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}`);
  await page.pdf({ path: outputFile, format: 'A4' });

  // Cleanup
  await browser.close();
  server.close();
  fs.unlinkSync(tempHtmlFile); // Delete the temporary HTML file
}

async function convertAllMarkdownsInDirectory(directory: string) {
  // Use glob to get all markdown files in directory and subdirectories
  const files = await glob('**/*.md', { cwd: directory, absolute: true });

  for (const filePath of files) {
    const outputFilePath = filePath
      .replace('.md', '.pdf')
      .replace(directory, 'pdfs');
    const outputDir = path.dirname(outputFilePath);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      await convertMarkdownToPdf(filePath, outputFilePath);
      console.log(`PDF generated: ${outputFilePath}`);
    } catch (err) {
      console.error(`Error generating PDF for ${filePath}: ${err}`);
    }
  }
}

// Start the conversion for all markdown files in the /docs folder
convertAllMarkdownsInDirectory(path.resolve(__dirname, 'docs'));
