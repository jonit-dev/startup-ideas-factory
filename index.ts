import fs from 'fs';
import { glob } from 'glob';
import MarkdownIt from 'markdown-it';
import path from 'path';
import puppeteer from 'puppeteer';

async function convertMarkdownToPdf(inputFile: string, outputFile: string) {
  const markdownContent = fs.readFileSync(inputFile, 'utf-8');
  const md = new MarkdownIt();
  const htmlContent = md.render(markdownContent);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent);
  await page.pdf({ path: outputFile, format: 'A4' });

  await browser.close();
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
