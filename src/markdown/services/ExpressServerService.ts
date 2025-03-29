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

    // Set up static file serving
    app.use(
      '/assets',
      express.static(path.join(__dirname, '..', '..', '..', 'docs', 'assets')),
    );
    app.use(
      '/styles',
      express.static(path.join(__dirname, '..', '..', '..', 'styles')),
    );

    // Set up route for the temp HTML file
    app.get('/', (req, res) => res.sendFile(tempHtmlFilePath));

    // Start the server on a random port
    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    return { server, port };
  }
}
