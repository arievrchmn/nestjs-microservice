// apps/user-service/src/app/app.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

// DTOs
import type { CreateUserRequestDTO, FindUserRequestDTO, UpdateUserRequestDTO } from '@nestjs-microservice/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('user.admin.create')
  createUser(@Payload() payload: CreateUserRequestDTO) {
    return this.appService.createUser(payload);
  }

  @MessagePattern('user.admin.find_all')
  findAllUser(@Payload() dto: FindUserRequestDTO) {
    return this.appService.findAllUser(dto);
  }

  @MessagePattern('user.admin.update')
  updateUser(@Payload() payload: UpdateUserRequestDTO & { id: string }) {
    const { id, ...updateData } = payload;
    const data = {
      id: Number(id),
      ...updateData,
    };
    return this.appService.updateUser({ ...data, send_notification: false });
  }

  @MessagePattern('user.admin.deactivate')
  deactivateUser(@Payload() id: string) {
    return this.appService.deactivateUser(Number(id));
  }

  @MessagePattern('user.auth.find_by_email')
  findAuthUserByEmail(@Payload() email: string) {
    return this.appService.findAuthUserByEmail(email);
  }

  @MessagePattern('user.staff.get_profile')
  getUserProfile(@Payload() user_id: number) {
    return this.appService.getUserProfile(user_id);
  }

  @MessagePattern('user.staff.update_profile')
  updateUserProfile(@Payload() payload: { id: number; photo_url?: string; phone?: string; password?: string }) {
    return this.appService.updateUser({ ...payload, send_notification: true });
  }
}
