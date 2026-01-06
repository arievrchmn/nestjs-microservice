// apps/user-service/src/main.ts

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'logging_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.listen();
  Logger.log(`🚀 Log Service is running on TCP 3004`);
}

bootstrap();
