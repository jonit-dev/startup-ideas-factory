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

      await page.goto(`http://localhost:${port}`, {
        waitUntil: 'networkidle0',
      });

      await page.pdf({
        path: outputFilePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '5mm',
          bottom: '10mm',
          left: '5mm',
        },
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
