import path from 'path';
import { inject, injectable } from 'tsyringe';
import { LoggerService } from '../services/LoggerService';
import { FileService } from './services/FileService';
import { MarkdownService } from './services/MarkdownService';
import { PdfService } from './services/PdfService';

@injectable()
export class MarkdownConverter {
  constructor(
    @inject(FileService) private fileService: FileService,
    @inject(MarkdownService) private markdownService: MarkdownService,
    @inject(PdfService) private pdfService: PdfService,
    @inject(LoggerService) private logger: LoggerService,
  ) {}

  async convertAllMarkdownsInDirectory(directory: string): Promise<void> {
    try {
      // Get all markdown files in the directory
      const files = await this.fileService.getMarkdownFiles(directory);
      if (!files.length) {
        this.logger.warn(`No markdown files found in directory: ${directory}`);
        return;
      }

      for (const filePath of files) {
        const outputFilePath = filePath
          .replace('.md', '.pdf')
          .replace(directory, 'pdfs');
        const outputDir = path.dirname(outputFilePath);

        // Ensure output directory exists
        this.fileService.ensureDirectoryExists(outputDir);

        // Convert the markdown file to PDF
        await this.convertMarkdownToPdf(filePath, outputFilePath);
      }
    } catch (err) {
      this.logger.error(`Error processing directory ${directory}: ${err}`);
    }
  }

  private async convertMarkdownToPdf(
    inputFile: string,
    outputFile: string,
  ): Promise<void> {
    try {
      this.logger.info(`Converting ${inputFile} to PDF`);

      // Read the markdown file
      const markdownContent = await this.fileService.readFile(inputFile);

      // Convert markdown to HTML
      const htmlContent =
        this.markdownService.convertMarkdownToHtml(markdownContent);

      // Get styled HTML document
      const styledHtmlContent =
        this.markdownService.getStyledHtmlDocument(htmlContent);

      // Write HTML to a temporary file
      const tempHtmlFile = path.join(__dirname, '..', 'temp.html');
      await this.fileService.writeFile(tempHtmlFile, styledHtmlContent);

      // Generate PDF from HTML
      await this.pdfService.generatePdf(tempHtmlFile, outputFile);

      // Delete temporary HTML file
      await this.fileService.deleteFile(tempHtmlFile);
    } catch (err) {
      this.logger.error(`Error converting markdown to PDF: ${err}`);
    }
  }

  public async mergePdfsInDirectory(
    directory: string,
    outputFile: string,
  ): Promise<void> {
    await this.pdfService.mergePdfs(directory, outputFile);
  }
}
