import { logger } from '../../logger';

export interface PrintSenderConfig {
  host: string;
  port: number;
  timeout?: number;
}

export interface PrintResult {
  success: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Send data to a network printer
 */
export class NetworkPrintSender {
  private config: PrintSenderConfig;
  
  constructor(config: PrintSenderConfig) {
    this.config = {
      timeout: 10000,
      ...config
    };
  }
  
  async send(data: Buffer): Promise<PrintResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const net = require('net');
      
      const socket = net.createConnection(this.config.port, this.config.host);
      
      socket.on('connect', () => {
        logger.debug(`Connected to printer ${this.config.host}:${this.config.port}`);
        socket.write(data);
        socket.end();
      });
      
      socket.on('end', () => {
        const responseTime = Date.now() - startTime;
        logger.debug(`Print job sent to ${this.config.host}:${this.config.port} in ${responseTime}ms`);
        resolve({
          success: true,
          responseTime
        });
      });
      
      socket.on('error', (error: Error) => {
        const responseTime = Date.now() - startTime;
        logger.error(`Print job failed to ${this.config.host}:${this.config.port}:`, error);
        resolve({
          success: false,
          error: error.message,
          responseTime
        });
      });
      
      // Timeout
      socket.setTimeout(this.config.timeout!, () => {
        socket.destroy();
        const responseTime = Date.now() - startTime;
        logger.error(`Print job timeout to ${this.config.host}:${this.config.port}`);
        resolve({
          success: false,
          error: 'Connection timeout',
          responseTime
        });
      });
    });
  }
}

/**
 * Send ZPL commands to Zebra printer
 */
export class ZebraPrintSender extends NetworkPrintSender {
  constructor(host: string, port: number = 9100) {
    super({ host, port });
  }
  
  async sendZPL(zplCommands: string): Promise<PrintResult> {
    const data = Buffer.from(zplCommands, 'utf8');
    return this.send(data);
  }
}

/**
 * Send to Brother QL printer (simplified)
 */
export class BrotherQLPrintSender extends NetworkPrintSender {
  constructor(host: string, port: number = 9100) {
    super({ host, port });
  }
  
  async sendRaster(rasterData: Buffer): Promise<PrintResult> {
    // For MVP, Brother QL will fall back to PDF generation
    // In a full implementation, this would send Brother-specific commands
    logger.info('Brother QL raster printing not implemented, falling back to PDF');
    return {
      success: true,
      error: 'Brother QL printing not implemented - PDF generated instead'
    };
  }
}

/**
 * Test printer connectivity
 */
export async function testPrinterConnection(host: string, port: number = 9100): Promise<PrintResult> {
  const sender = new NetworkPrintSender({ host, port });
  
  // Send a simple test command
  const testData = Buffer.from('^XA^XZ\n', 'utf8'); // ZPL test command
  
  try {
    const result = await sender.send(testData);
    logger.info(`Printer test ${host}:${port} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    return result;
  } catch (error) {
    logger.error(`Printer test ${host}:${port} failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get printer status (simplified)
 */
export async function getPrinterStatus(host: string, port: number = 9100): Promise<{
  online: boolean;
  lastSeen?: Date;
  error?: string;
}> {
  try {
    const testResult = await testPrinterConnection(host, port);
    
    return {
      online: testResult.success,
      lastSeen: testResult.success ? new Date() : undefined,
      error: testResult.error
    };
  } catch (error) {
    return {
      online: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
