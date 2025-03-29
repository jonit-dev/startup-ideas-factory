import markdownit from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import { inject, injectable } from 'tsyringe';
import { CodeBlockService } from './CodeBlockService';

@injectable()
export class MarkdownService {
  constructor(
    @inject(CodeBlockService) private codeBlockService: CodeBlockService,
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
    // Log all image references found in Markdown
    console.log(
      'Original markdown before image processing:',
      markdown.match(/!\[(.*?)\]\((.*?)\)/g),
    );

    // Transform all image paths to work with our Express server
    // Handle all possible path formats including direct references to img/
    const processed = markdown
      // Handle ./img/file.png format
      .replace(
        /!\[(.*?)\]\((\.\/img\/(.*?))\)/g,
        (match, alt, fullPath, imgPath) => {
          console.log(
            `Transforming ./img/ path: ${fullPath} -> /img/${imgPath}`,
          );
          return `![${alt}](/img/${imgPath})`;
        },
      )
      // Handle img/file.png format
      .replace(
        /!\[(.*?)\]\((img\/(.*?))\)/g,
        (match, alt, fullPath, imgPath) => {
          console.log(`Transforming img/ path: ${fullPath} -> /img/${imgPath}`);
          return `![${alt}](/img/${imgPath})`;
        },
      )
      // Handle /img/file.png format (already correctly formatted but log for debugging)
      .replace(
        /!\[(.*?)\]\((\/img\/(.*?))\)/g,
        (match, alt, fullPath, imgPath) => {
          console.log(`Already correct path format: ${fullPath}`);
          return match; // No change needed
        },
      );

    console.log(
      'Processed markdown after image transformation:',
      processed.match(/!\[(.*?)\]\((?:\/img\/|img\/|\.\/img\/)(.*?)\)/g),
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

  getStyledHtmlDocument(htmlContent: string): string {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Output</title>

       <!-- Additional styles and fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/styles/index.css"> 
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Noto+Color+Emoji">

    <style>
      /* Responsive image styles */
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1.5em auto;
      }
      /* Ensure content doesn't overflow container */
      body {
        overflow-x: hidden;
        width: 100%;
      }
    </style>
    
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
    <script src="
https://cdn.jsdelivr.net/npm/highlightjs-solidity@2.0.6/dist/solidity.min.js
"></script>
    <script>
    hljs.highlightAll();
    </script>

    <!-- Mermaid script -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        mermaid.initialize({ 
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default'
        });
        
        // Initialize mermaid diagrams after page loads
        setTimeout(() => {
          mermaid.run();
        }, 1000);
      });
    </script>
 
</head>
<body>
    <!-- Your HTML content goes here -->
    ${htmlContent}
</body>
</html>
    `;
  }
}
