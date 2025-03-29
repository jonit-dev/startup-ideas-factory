import PDFMerger from 'pdf-merger-js';
import puppeteer from 'puppeteer';
import { inject, injectable } from 'tsyringe';
import { ExpressServerService } from './ExpressServerService';
import { FileService } from './FileService';

@injectable()
export class PdfService {
  constructor(
    @inject(FileService) private fileService: FileService,
    @inject(ExpressServerService) private expressService: ExpressServerService,
  ) {}

  async generatePdf(
    htmlFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    try {
      // Start the Express server
      const { server, port } =
        await this.expressService.createServer(htmlFilePath);

      // Launch browser and create PDF
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      // Track network requests to debug image loading
      const pendingRequests = new Set();
      page.on('request', (request) => {
        const url = request.url();
        pendingRequests.add(url);
        console.log(`Network request: ${url}`);
      });

      page.on('requestfailed', (request) => {
        const url = request.url();
        pendingRequests.delete(url);
        console.log(`Failed request: ${url} - ${request.failure()?.errorText}`);
      });

      page.on('requestfinished', (request) => {
        const url = request.url();
        pendingRequests.delete(url);
        console.log(`Finished request: ${url}`);
      });

      // Log console messages from the browser
      page.on('console', (msg) => {
        console.log(`Browser console: ${msg.text()}`);
      });

      await page.goto(`http://localhost:${port}`, {
        waitUntil: 'networkidle0',
        timeout: 60000, // Increase timeout to 60 seconds
      });

      // Extract and log the actual img tags from the rendered page
      const imageTags = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map((img) => ({
          src: img.src,
          alt: img.alt,
        }));
      });
      console.log(
        'Image tags found in HTML:',
        JSON.stringify(imageTags, null, 2),
      );

      // Wait for all images to load
      if (imageTags.length > 0) {
        console.log('Waiting for images to load...');
        // Wait for all image elements to load or fail
        await page.evaluate(() => {
          return new Promise((resolve) => {
            // Check if all images are complete
            const allImagesLoaded = Array.from(
              document.querySelectorAll('img'),
            ).every((img) => img.complete);

            if (allImagesLoaded) {
              resolve(true);
              return;
            }

            // Wait for images to load
            let loadedImages = 0;
            const imgElements = document.querySelectorAll('img');
            const totalImages = imgElements.length;

            function onLoad() {
              loadedImages++;
              if (loadedImages === totalImages) {
                resolve(true);
              }
            }

            imgElements.forEach((img) => {
              if (img.complete) {
                loadedImages++;
              } else {
                img.addEventListener('load', onLoad);
                img.addEventListener('error', onLoad);
              }
            });

            if (loadedImages === totalImages) {
              resolve(true);
            }

            // Safety timeout after 5 seconds
            setTimeout(() => resolve(true), 5000);
          });
        });
        console.log('All images loaded or timed out');
      }

      await page.pdf({
        path: outputFilePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        scale: 0.9, // Scale down content slightly to ensure better fit
        preferCSSPageSize: true, // Use CSS print styling
        displayHeaderFooter: false,
      });

      // Cleanup
      await browser.close();
      server.close();
      console.log(`PDF generated: ${outputFilePath}`);
    } catch (err) {
      console.error(`Error generating PDF for ${htmlFilePath}: ${err}`);
    }
  }

  async mergePdfs(directory: string, outputFile: string): Promise<void> {
    try {
      const merger = new PDFMerger();
      let pdfFiles = await this.fileService.getPdfFiles(directory);

      // Sort the pdfFiles array by the numeric prefix
      pdfFiles = this.fileService.sortFiles(pdfFiles, 'pdf');

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
}
