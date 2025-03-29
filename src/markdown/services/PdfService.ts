import PDFMerger from 'pdf-merger-js';
import puppeteer from 'puppeteer';
import { inject, injectable } from 'tsyringe';
import { LoggerService } from '../../services/LoggerService';
import { ExpressServerService } from './ExpressServerService';
import { FileService } from './FileService';

@injectable()
export class PdfService {
  constructor(
    @inject(FileService) private fileService: FileService,
    @inject(ExpressServerService) private expressService: ExpressServerService,
    @inject(LoggerService) private logger: LoggerService,
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
        this.logger.debug(`Network request: ${url}`);
      });

      page.on('requestfailed', (request) => {
        const url = request.url();
        pendingRequests.delete(url);
        this.logger.error(`Failed to load resource: ${url}`);
      });

      page.on('requestfinished', (request) => {
        const url = request.url();
        pendingRequests.delete(url);
      });

      // Log console messages from the browser
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          this.logger.error(`Browser error: ${msg.text()}`);
        }
      });

      await page.goto(`http://localhost:${port}`, {
        waitUntil: 'networkidle0',
        timeout: 60000, // Increase timeout to 60 seconds
      });

      // Extract the actual img tags from the rendered page
      const imageTags = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map((img) => ({
          src: img.src,
          alt: img.alt,
        }));
      });

      // Wait for all images to load
      if (imageTags.length > 0) {
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
      this.logger.info(`PDF generated: ${outputFilePath}`);
    } catch (err) {
      this.logger.error(`Error generating PDF for ${htmlFilePath}: ${err}`);
    }
  }

  async mergePdfs(directory: string, outputFile: string): Promise<void> {
    try {
      const merger = new PDFMerger();
      let pdfFiles = await this.fileService.getPdfFiles(directory);

      // Sort the pdfFiles array by the numeric prefix
      pdfFiles = this.fileService.sortFiles(pdfFiles, 'pdf');

      for (const pdfFile of pdfFiles) {
        await merger.add(pdfFile);
      }

      await merger.save(outputFile);
      this.logger.info(`PDFs merged successfully: ${outputFile}`);
    } catch (err) {
      this.logger.error(`Error merging PDFs in directory ${directory}: ${err}`);
    }
  }
}
