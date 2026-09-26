import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
const express = require('express');

const server = express();

export const createNestServer = async (expressInstance: any) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance), {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  return app.init();
};

createNestServer(server)
  .then(() => console.log('NestJS Vercel serverless function initialized'))
  .catch((err) => console.error('NestJS initialization error', err));

export default server;
