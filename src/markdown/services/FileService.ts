import { existsSync, mkdirSync } from 'fs';
import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import { injectable } from 'tsyringe';

@injectable()
export class FileService {
  async getMarkdownFiles(directory: string): Promise<string[]> {
    let files = await glob('**/*.md', { cwd: directory, absolute: true });
    files = this.sortFiles(files, 'md');
    return files;
  }

  async getPdfFiles(directory: string): Promise<string[]> {
    let pdfs = await glob('**/*.pdf', { cwd: directory, absolute: true });
    pdfs = pdfs.filter((pdf) => pdf.includes('output.pdf') !== true);
    return pdfs;
  }

  ensureDirectoryExists(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content);
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  sortFiles(files: string[], fileType: 'md' | 'pdf'): string[] {
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
}
