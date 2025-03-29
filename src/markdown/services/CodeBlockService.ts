import hljs from 'highlight.js';
import { injectable } from 'tsyringe';

@injectable()
export class CodeBlockService {
  /**
   * Transforms markdown code blocks with syntax highlighting
   */
  transformCodeBlocks(markdownText: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    return markdownText.replace(codeBlockRegex, (match, lang, code) => {
      let highlightedCode;
      if (lang && hljs.getLanguage(lang)) {
        highlightedCode = hljs.highlight(code, {
          language: lang,
        }).value;
      } else {
        // Use auto mode when language is not found
        highlightedCode = hljs.highlightAuto(code).value;
        lang = 'auto';
      }

      // Return the highlighted code wrapped in appropriate tags to prevent escaping
      return `\`\`\`${lang}\n${highlightedCode}\`\`\``;
    });
  }

  /**
   * Loads additional language support for highlight.js if needed
   */
  loadAdditionalLanguages(): void {
    // This method can be implemented to load additional language support
    // Example: loadLanguage('solidity');
  }
}
