import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import { container } from 'tsyringe';
import './markdown/container'; // Import container configuration
import { MarkdownConverter } from './markdown/MarkdownConverter';

const DOCS_DIR = path.resolve(__dirname, '../docs');
const PDFS_DIR = path.resolve(__dirname, '../pdfs');
const OUTPUT_DIR = path.resolve(__dirname, '../output');

const ensureDirectoryExists = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getDirectories = (baseDir: string): string[] => {
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        !dirent.name.startsWith('styles') &&
        !dirent.name.startsWith('assets'),
    )
    .map((dirent) => dirent.name);
};

const cleanUpPdfs = (baseDir: string): void => {
  const pdfs = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.pdf'))
    .map((dirent) => dirent.name);

  pdfs.forEach((pdf) => fs.unlinkSync(path.resolve(baseDir, pdf)));
};

const convertDirectory = async (dir: string): Promise<void> => {
  const dirPath = path.resolve(DOCS_DIR, dir);
  const mdConverter = container.resolve<MarkdownConverter>(MarkdownConverter);
  await mdConverter.convertAllMarkdownsInDirectory(dirPath);
  ensureDirectoryExists(OUTPUT_DIR); // Ensure the output directory exists
  await mdConverter.mergePdfsInDirectory(PDFS_DIR, `${OUTPUT_DIR}/${dir}.pdf`);
  cleanUpPdfs(PDFS_DIR);
};

const main = async () => {
  const directories = getDirectories(DOCS_DIR);
  const regex = new RegExp(process.argv[2]);

  console.log('Scanning directories: ', directories);

  for (const dir of directories) {
    if (regex.test(dir)) {
      await convertDirectory(dir);
    }
  }
};

main();
