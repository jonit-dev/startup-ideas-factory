import fs from 'fs';
import path from 'path';
import { MarkdownConverter } from './MarkdownConverter';

(async () => {
  const mdConverter = new MarkdownConverter();

  // Get all top level directories
  const directories = fs
    .readdirSync(path.resolve(__dirname, '../docs'), { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        !dirent.name.startsWith('styles') &&
        !dirent.name.startsWith('assets'),
    )
    .map((dirent) => dirent.name);

  console.log('Scanning directories: ', directories);

  // Loop through each directory and convert markdown files
  for (const dir of directories) {
    await mdConverter.convertAllMarkdownsInDirectory(
      path.resolve(__dirname, '../docs', dir), // Corrected path
    );

    await mdConverter.mergePdfsInDirectory('pdfs', `./output/${dir}.pdf`);

    // cleanup all pdfs generated individually

    const pdfs = fs
      .readdirSync(path.resolve(__dirname, '../pdfs'), { withFileTypes: true })
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.pdf'))
      .map((dirent) => dirent.name);

    for (const pdf of pdfs) {
      fs.unlinkSync(path.resolve(__dirname, '../pdfs', pdf));
    }
  }
})();
