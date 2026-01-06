// apps/api-gateway/src/app/admin/sub.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from '@nestjs-microservice/firebase';

@Controller('admin')
export class AdminSubController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('subscribe-topic')
  async subscribeToTopic(@Body() body: { fcm_token: string; topic: string }) {
    await this.firebaseService.subscribeToTopic(body.fcm_token, body.topic);
    return { success: true, message: 'Subscribed to notifications' };
  }
}
