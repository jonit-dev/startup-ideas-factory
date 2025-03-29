import markdownit from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import { inject, injectable } from 'tsyringe';
import { LoggerService } from '../../services/LoggerService';
import { CodeBlockService } from './CodeBlockService';

@injectable()
export class MarkdownService {
  constructor(
    @inject(CodeBlockService) private codeBlockService: CodeBlockService,
    @inject(LoggerService) private logger: LoggerService,
  ) {}

  convertMarkdownToHtml(markdownContent: string): string {
    const md = markdownit({
      html: true,
      linkify: true,
    }).use(emoji);

    // Process image paths before rendering
    markdownContent = this.processImagePaths(markdownContent);

    // Ensure we are using the styled markdown which contains highlighted HTML
    let htmlContent = md.render(markdownContent);
    htmlContent = this.codeBlockService.transformCodeBlocks(htmlContent);

    // Process mermaid diagrams manually to ensure proper rendering
    htmlContent = this.processMermaidDiagrams(htmlContent);

    return htmlContent;
  }

  private processImagePaths(markdown: string): string {
    // Transform all image paths to work with our Express server
    const processed = markdown
      // Handle ./img/file.png format
      .replace(
        /!\[(.*?)\]\((\.\/img\/(.*?))\)/g,
        (match, alt, fullPath, imgPath) => {
          this.logger.debug(
            `Transforming ./img/ path: ${fullPath} -> /img/${imgPath}`,
          );
          return `![${alt}](/img/${imgPath})`;
        },
      )
      // Handle img/file.png format
      .replace(
        /!\[(.*?)\]\((img\/(.*?))\)/g,
        (match, alt, fullPath, imgPath) => {
          this.logger.debug(
            `Transforming img/ path: ${fullPath} -> /img/${imgPath}`,
          );
          return `![${alt}](/img/${imgPath})`;
        },
      )
      // Handle /img/file.png format (already correctly formatted)
      .replace(
        /!\[(.*?)\]\((\/img\/(.*?))\)/g,
        (match) => match, // No change needed
      );

    return processed;
  }

  private processMermaidDiagrams(html: string): string {
    // Look for code blocks with mermaid class
    const regex =
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

    // Replace them with div elements that Mermaid can process
    return html.replace(regex, (match, codeContent) => {
      const decodedContent = this.decodeHtmlEntities(codeContent);
      return `<div class="mermaid">${decodedContent}</div>`;
    });
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  getStyledHtmlDocument(
    htmlContent: string,
    title: string = 'Document',
  ): string {
    // Process special content blocks for Mermaid diagrams
    const processedHtml = this.processMermaidBlocks(htmlContent);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <!-- Prevent favicon requests -->
        <link rel="icon" href="data:,">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 0.75em 2em 2em 2em;
            overflow-x: hidden;
            width: 100%;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1.5em auto;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          code {
            background-color: #f8f9fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          }
          pre {
            background-color: #f8f9fa;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
          }
          blockquote {
            border-left: 4px solid #dfe2e5;
            margin: 0;
            padding-left: 1em;
            color: #6a737d;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          th, td {
            border: 1px solid #dfe2e5;
            padding: 0.5em;
            text-align: left;
          }
          th {
            background-color: #f6f8fa;
          }
          ul, ol {
            padding-left: 2em;
          }
          a {
            color: #0366d6;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .mermaid {
            margin: 1.5em 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${processedHtml}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markdown.min.js"></script>
        
        <!-- Mermaid script -->
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            mermaid.initialize({ 
              startOnLoad: true,
              securityLevel: 'loose',
              theme: 'default',
              logLevel: 'error',
              fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
              flowchart: {
                htmlLabels: true,
                curve: 'linear'
              }
            });
            
            // Give ample time for the page to load before rendering diagrams
            setTimeout(() => {
              try {
                // Find all Mermaid diagram blocks and initialize them
                const mermaidDivs = document.querySelectorAll('.mermaid');
                console.log('Found ' + mermaidDivs.length + ' Mermaid diagrams');
                
                // Run mermaid with a 3 second timeout to ensure everything is loaded
                mermaid.run();
              } catch (e) {
                console.error('Error initializing Mermaid:', e);
              }
            }, 3000);
          });
        </script>
      </body>
    </html>
    `;
  }

  private processMermaidBlocks(html: string): string {
    // Find markdown code blocks with mermaid and replace them with proper mermaid div blocks
    const mermaidBlockRegex =
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

    return html.replace(mermaidBlockRegex, (match, codeContent) => {
      // Decode HTML entities
      const decodedContent = codeContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      return `<div class="mermaid">${decodedContent.trim()}</div>`;
    });
  }
}
