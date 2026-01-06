import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('log.update_user')
  async handleProfileUpdated(@Payload() data: any) {
    await this.appService.createLog(data);
  }
}
