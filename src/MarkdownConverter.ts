import express from 'express';
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods from 'fs'
import fs from 'fs/promises'; // Import promises API of fs for async operations
import { glob } from 'glob';
import MarkdownIt from 'markdown-it';
import { AddressInfo } from 'net';
import path from 'path';
import PDFMerger from 'pdf-merger-js';
import puppeteer from 'puppeteer';

import hljs from 'highlight.js';

export class MarkdownConverter {
  public async convertAllMarkdownsInDirectory(directory) {
    const files = await glob('**/*.md', { cwd: directory, absolute: true });
    for (const filePath of files) {
      const outputFilePath = filePath
        .replace('.md', '.pdf')
        .replace(directory, 'pdfs');
      const outputDir = path.dirname(outputFilePath);
      if (!existsSync(outputDir)) {
        // Use synchronous existsSync method
        mkdirSync(outputDir, { recursive: true }); // Use synchronous mkdirSync method
      }
      await this.convertMarkdownToPdf(filePath, outputFilePath);
    }
  }

  private async convertMarkdownToPdf(inputFile, outputFile) {
    try {
      const markdownContent = await fs.readFile(inputFile, 'utf-8');
      const styledHtmlContent = this.getStyledHtmlContent(markdownContent);
      const tempHtmlFile = path.join(__dirname, 'temp.html');
      await fs.writeFile(tempHtmlFile, styledHtmlContent);

      const app = express();
      app.use(
        '/assets',
        express.static(path.join(__dirname, '..', 'docs', 'assets')),
      );
      app.use(
        '/styles',
        express.static(path.join(__dirname, '..', 'docs', 'styles')),
      );
      app.get('/', (req, res) => res.sendFile(tempHtmlFile));

      const server = app.listen(0);
      const port = (server.address() as AddressInfo).port;

      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.goto(`http://localhost:${port}`, {
        waitUntil: 'networkidle0',
      });
      await page.pdf({
        path: outputFile,
        format: 'A4',
        printBackground: true, // Ensure backgrounds are printed

        margin: {
          top: '10mm', // default is 0, units: mm, cm, in, px
          right: '5mm', // default is 0, units: mm, cm, in, px
          bottom: '10mm', // default is 0, units: mm, cm, in, px
          left: '5mm', // default is 0, units: mm, cm, in, px
        },
      });

      await browser.close();
      server.close();
      await fs.unlink(tempHtmlFile);
      console.log(`PDF generated: ${outputFile}`);
    } catch (err) {
      console.error(`Error generating PDF for ${inputFile}: ${err}`);
    }
  }

  public async mergePdfsInDirectory(directory: string, outputFile: string) {
    try {
      const merger = new PDFMerger();
      let pdfFiles = await this.getPdfFiles(directory);

      // Sort the pdfFiles array by the numeric prefix
      pdfFiles = pdfFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\/(\d+)-/)?.[1] ?? '', 10);
        const numB = parseInt(b.match(/\/(\d+)-/)?.[1] ?? '', 10);
        return numA - numB;
      });

      for (const pdfFile of pdfFiles) {
        await merger.add(pdfFile);
      }

      await merger.save(outputFile);

      console.log(`PDFs merged successfully: ${outputFile}`);
    } catch (err) {
      console.error(`Error merging PDFs in directory ${directory}: ${err}`);
    }
  }

  private async getPdfFiles(directory: string): Promise<string[]> {
    let pdfs = await glob('**/*.pdf', { cwd: directory, absolute: true });

    pdfs = pdfs.filter((pdf) => pdf.includes('output.pdf') !== true);

    return pdfs;
  }
  private getStyledHtmlContent(markdownContent: string): string {
    const md = new MarkdownIt({
      html: true, // Allow HTML tags in the source
    });

    // Ensure we are using the styled markdown which contains highlighted HTML
    let htmlContent = md.render(markdownContent);

    htmlContent = this.styleMarkdownCodeBlocks(htmlContent);

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go Error Handling Examples</title>
    <!-- Include only the dark theme CSS for Highlight.js -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/dark.min.css">
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
            });
        });
    </script>

    <!-- Additional styles and fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/styles/index.css">
    <link rel="stylesheet" type="text/css" href="/styles/atom-one-dark.min.css">
</head>
<body>
    <!-- Your HTML content goes here -->
    ${htmlContent}
</body>
</html>
    `;
  }

  private styleMarkdownCodeBlocks(markdownText: string): string {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;

    return markdownText.replace(regex, (match, lang, code) => {
      const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlightedCode = hljs.highlight(code, {
        language: validLang,
      }).value;

      // Return the highlighted code wrapped in appropriate tags to prevent escaping
      return `\`\`\`${validLang}\n${highlightedCode}\`\`\``;
    });
  }
}
