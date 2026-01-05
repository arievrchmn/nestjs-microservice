import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.login')
  login(@Payload() payload: { email: string; password: string }) {
    return this.appService.login(payload);
  }

  @MessagePattern('auth.validate_token')
  validateToken(@Payload() token: string) {
    return this.appService.validateToken(token);
  }
}
