export interface DocumentServiceConfig {
  port: number;
  serviceName: string;
  corsOrigins: string[];
}

export const config: DocumentServiceConfig = {
  port: parseInt(process.env.PORT || '3005', 10),
  serviceName: 'bia-document-service',
  corsOrigins: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.cambobia.com',
    'https://trade.cambobia.com'
  ]
};
