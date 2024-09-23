import express from 'express';
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods from 'fs'
import fs from 'fs/promises'; // Import promises API of fs for async operations
import { glob } from 'glob';
import hljs from 'highlight.js';
import markdownit from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import { AddressInfo } from 'net';
import path from 'path';
import PDFMerger from 'pdf-merger-js';
import puppeteer from 'puppeteer';

export class MarkdownConverter {
  async convertAllMarkdownsInDirectory(directory: string): Promise<void> {
    let files = await glob('**/*.md', { cwd: directory, absolute: true });

    // Improved sorting function that handles chapters and sub-chapters correctly
    files = this.sortFiles(files, 'md');

    console.log(files);

    for (const filePath of files) {
      const outputFilePath = filePath
        .replace('.md', '.pdf')
        .replace(directory, 'pdfs');
      const outputDir = path.dirname(outputFilePath);

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      await this.convertMarkdownToPdf(filePath, outputFilePath);
    }
  }

  private async convertMarkdownToPdf(inputFile: string, outputFile: string) {
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
      app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));

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
        printBackground: true,
        margin: {
          top: '10mm',
          right: '5mm',
          bottom: '10mm',
          left: '5mm',
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
      pdfFiles = this.sortFiles(pdfFiles, 'pdf');

      console.log(pdfFiles);

      for (const pdfFile of pdfFiles) {
        await merger.add(pdfFile);
      }

      await merger.save(outputFile);

      console.log(`PDFs merged successfully: ${outputFile}`);
    } catch (err) {
      console.error(`Error merging PDFs in directory ${directory}: ${err}`);
    }
  }

  private sortFiles(files: string[], fileType: 'md' | 'pdf'): string[] {
    return files.sort((a, b) => {
      const extractNumbers = (filename: string): number[] => {
        const baseName = path.basename(filename, `.${fileType}`);
        const numberParts = baseName
          .split(/[-.]/)
          .filter((part) => /^\d+$/.test(part));
        return numberParts.map((num) => parseInt(num, 10));
      };

      const aNumbers = extractNumbers(a);
      const bNumbers = extractNumbers(b);

      for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
        if ((aNumbers[i] || 0) !== (bNumbers[i] || 0)) {
          return (aNumbers[i] || 0) - (bNumbers[i] || 0);
        }
      }

      // If all number parts are equal, compare the whole strings to maintain stability
      return a.localeCompare(b);
    });
  }

  private async getPdfFiles(directory: string): Promise<string[]> {
    let pdfs = await glob('**/*.pdf', { cwd: directory, absolute: true });

    pdfs = pdfs.filter((pdf) => pdf.includes('output.pdf') !== true);

    return pdfs;
  }
  private getStyledHtmlContent(markdownContent: string): string {
    const md = markdownit({
      html: true,
      linkify: true,
    }).use(emoji);

    // Ensure we are using the styled markdown which contains highlighted HTML
    let htmlContent = md.render(markdownContent);

    htmlContent = this.styleMarkdownCodeBlocks(htmlContent);

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Output</title>

       <!-- Additional styles and fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/styles/index.css"> 
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Noto+Color+Emoji">

    
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
    <script src="
https://cdn.jsdelivr.net/npm/highlightjs-solidity@2.0.6/dist/solidity.min.js
"></script>
    <script>
    hljs.highlightAll();

    </script>

 
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
      let highlightedCode;
      if (lang && hljs.getLanguage(lang)) {
        highlightedCode = hljs.highlight(code, {
          language: lang,
        }).value;
      } else {
        // Use auto mode when language is not found
        highlightedCode = hljs.highlightAuto(code).value;
        lang = 'auto';
      }

      // Return the highlighted code wrapped in appropriate tags to prevent escaping
      return `\`\`\`${lang}\n${highlightedCode}\`\`\``;
    });
  }
}
