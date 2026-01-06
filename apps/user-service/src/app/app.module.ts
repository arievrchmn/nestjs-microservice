// apps/user-service/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';

import { NestjsMicroserviceFirebaseModule } from '@nestjs-microservice/firebase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/user-service/.env',
    }),
    NestjsMicroserviceFirebaseModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
