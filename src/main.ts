import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import rawBodyMiddleware from '../src/middlewares/raw-body.middleware';
import helmet from 'helmet';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(rawBodyMiddleware());
  // API doc configuration
  const config = new DocumentBuilder()
    .setTitle('Rabble API')
    .setDescription('The rabble API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  app.enableCors();
  app.enableShutdownHooks();
  app.use(helmet());
  await app.listen(port);
  console.log(`Server running on port ${await app.getUrl()}`);
}
bootstrap();
