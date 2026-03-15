export interface AdvisoryServiceConfig {
  port: number;
  serviceName: string;
  corsOrigins: string[];
}

export const config: AdvisoryServiceConfig = {
  port: parseInt(process.env.PORT || '3006', 10),
  serviceName: 'bia-advisory-service',
  corsOrigins: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.cambobia.com',
    'https://trade.cambobia.com'
  ]
};
