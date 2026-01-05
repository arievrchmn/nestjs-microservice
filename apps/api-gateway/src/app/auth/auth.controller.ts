// apps/api-gateway/src/app/auth/auth.controller.ts

import { Controller, Post, Body, Inject, HttpCode } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: any) {
    return await firstValueFrom(this.authClient.send('auth.login', body));
  }
}
