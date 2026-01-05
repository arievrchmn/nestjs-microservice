// apps/user-service/src/app/app.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { User as UserModel } from '@nestjs-microservice/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('user.create')
  createUser(@Payload() payload: any) {
    return this.appService.createUser(payload);
  }

  @MessagePattern('users.find_all')
  findAllUsers(@Payload() payload: any) {
    return this.appService.findAllUsers(payload);
  }

  @MessagePattern('user.update')
  updateUser(@Payload() payload: any) {
    const { id, ...updateData } = payload;
    return this.appService.updateUser(parseInt(id), updateData as Partial<UserModel>);
  }

  @MessagePattern('user.deactivate')
  deactivateUser(@Payload() payload: any) {
    const { id } = payload;
    return this.appService.deactivateUser(parseInt(id));
  }

  @MessagePattern('user.auth.find_by_email')
  findAuthUserByEmail(email: string) {
    return this.appService.findAuthUserByEmail(email);
  }
}
