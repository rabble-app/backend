import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedServer;

// eslint-disable-next-line prettier/prettier
export const handler = async (event:any, context) => {
  if (!cachedServer) {
    if (event.path === '/api') {
      event.path = '/api/';
    }
    event.path = event?.path?.includes('swagger-ui')
      ? `/api${event.path}`
      : event.path;
    const nestApp = await NestFactory.create(AppModule);
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
