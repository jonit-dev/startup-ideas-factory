import path from 'path';
import { inject, injectable } from 'tsyringe';
import { FileService } from './services/FileService';
import { MarkdownService } from './services/MarkdownService';
import { PdfService } from './services/PdfService';

@injectable()
export class MarkdownConverter {
  constructor(
    @inject(FileService) private fileService: FileService,
    @inject(MarkdownService) private markdownService: MarkdownService,
    @inject(PdfService) private pdfService: PdfService,
  ) {}

  async convertAllMarkdownsInDirectory(directory: string): Promise<void> {
    // Get all markdown files in the directory
    const files = await this.fileService.getMarkdownFiles(directory);
    console.log(files);

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
  }

  private async convertMarkdownToPdf(
    inputFile: string,
    outputFile: string,
  ): Promise<void> {
    try {
      console.log(`Converting ${inputFile} to PDF`);

      // Read the markdown file
      const markdownContent = await this.fileService.readFile(inputFile);

      // Convert markdown to HTML
      const htmlContent =
        this.markdownService.convertMarkdownToHtml(markdownContent);

      // Log image tags in HTML
      const imgTagRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const imageTags = [...htmlContent.matchAll(imgTagRegex)];
      console.log(
        'Image tags in HTML content:',
        imageTags.map((match) => ({ fullTag: match[0], src: match[1] })),
      );

      // Get styled HTML document
      const styledHtmlContent =
        this.markdownService.getStyledHtmlDocument(htmlContent);

      // Write HTML to a temporary file
      const tempHtmlFile = path.join(__dirname, '..', 'temp.html');
      await this.fileService.writeFile(tempHtmlFile, styledHtmlContent);
      console.log(`Temporary HTML file created at: ${tempHtmlFile}`);

      // Generate PDF from HTML
      await this.pdfService.generatePdf(tempHtmlFile, outputFile);

      // Delete temporary HTML file
      await this.fileService.deleteFile(tempHtmlFile);
    } catch (err) {
      console.error(`Error converting markdown to PDF: ${err}`);
    }
  }

  public async mergePdfsInDirectory(
    directory: string,
    outputFile: string,
  ): Promise<void> {
    await this.pdfService.mergePdfs(directory, outputFile);
  }
}
