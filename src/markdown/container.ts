import { container } from 'tsyringe';
import { CodeBlockService } from './services/CodeBlockService';
import { ExpressServerService } from './services/ExpressServerService';
import { FileService } from './services/FileService';
import { MarkdownService } from './services/MarkdownService';
import { PdfService } from './services/PdfService';

// Register all services
container.register(FileService, { useClass: FileService });
container.register(MarkdownService, { useClass: MarkdownService });
container.register(ExpressServerService, { useClass: ExpressServerService });
container.register(PdfService, { useClass: PdfService });
container.register(CodeBlockService, { useClass: CodeBlockService });

export { container };
