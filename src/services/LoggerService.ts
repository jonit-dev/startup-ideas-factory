import { injectable } from 'tsyringe';
import { config } from '../config/env';

@injectable()
export class LoggerService {
  private isDebugMode: boolean;

  constructor() {
    this.isDebugMode = config.debug;
  }

  debug(...args: any[]): void {
    if (this.isDebugMode) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]): void {
    console.log('[INFO]', ...args);
  }

  error(...args: any[]): void {
    console.error('[ERROR]', ...args);
  }

  warn(...args: any[]): void {
    console.warn('[WARN]', ...args);
  }
}
