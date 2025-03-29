import express from 'express';
import { AddressInfo } from 'net';
import path from 'path';
import { injectable } from 'tsyringe';

@injectable()
export class ExpressServerService {
  async createServer(
    tempHtmlFilePath: string,
  ): Promise<{ server: any; port: number }> {
    const app = express();

    // Set up static file serving for assets
    app.use(
      '/assets',
      express.static(path.join(__dirname, '..', '..', '..', 'docs', 'assets')),
    );

    // Set up static file serving for images from both locations
    app.use(
      '/img',
      express.static(path.join(__dirname, '..', '..', '..', 'docs', 'img')),
    );
    app.use(
      '/img',
      express.static(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'docs',
          'lean-product-playbook',
          'img',
        ),
      ),
    );

    // Set up route for the temp HTML file
    app.get('/', (req, res) => res.sendFile(tempHtmlFilePath));

    // Start the server on a random port
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    return { server, port };
  }
}
