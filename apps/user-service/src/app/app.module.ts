// apps/user-service/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';

import { NestjsMicroserviceFirebaseModule } from '@nestjs-microservice/firebase';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/user-service/.env',
    }),
    ClientsModule.register([
      {
        name: 'LOGGING_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'logging_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    NestjsMicroserviceFirebaseModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
