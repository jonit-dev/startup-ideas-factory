import { container } from 'tsyringe';
import { MarkdownConverter } from './MarkdownConverter';

// Register the main converter - other services will be auto-registered
container.registerSingleton(MarkdownConverter);

export { container };
