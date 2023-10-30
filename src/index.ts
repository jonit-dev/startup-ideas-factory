import path from 'path';
import { MarkdownConverter } from './MarkdownConverter';

(async () => {
  const mdConverter = new MarkdownConverter();

  // Start the conversion for all markdown files in the /docs folder

  await mdConverter.convertAllMarkdownsInDirectory(
    path.resolve(__dirname, '..', 'docs')
  );

  await mdConverter.mergePdfsInDirectory('pdfs', './pdfs/output.pdf');
})();
