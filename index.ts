import fs from 'fs';
import markdownIt from 'markdown-it';
import path from 'path';
import puppeteer from 'puppeteer';

const markdownConverter = markdownIt();

const readAndCombineMarkdownFiles = (folderPath: string): string => {
  const files = fs.readdirSync(folderPath);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  let combinedMarkdown = '';
  for (const file of markdownFiles) {
    const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
    combinedMarkdown += content + '\n\n';
  }
  return combinedMarkdown;
};

const convertToHTML = (markdownContent: string): string => {
  return '<!DOCTYPE html><html><head><title>Markdown to PDF</title></head><body>' +
         markdownConverter.render(markdownContent) +
         '</body></html>';
};

const exportToPDF = async (htmlContent: string, outputPath: string) => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();
};

const main = async () => {
  const folderPath = './docs';
  const outputPath = './output.pdf';

  const combinedMarkdown = readAndCombineMarkdownFiles(folderPath);
  const htmlContent = convertToHTML(combinedMarkdown);
  await exportToPDF(htmlContent, outputPath);
};

main().catch(console.error);
