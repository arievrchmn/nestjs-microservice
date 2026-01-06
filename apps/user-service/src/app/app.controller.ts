// apps/user-service/src/app/app.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

// DTOs
import type {
  CreateUserRequestDTO,
  FindUserRequestDTO,
  UpdateUserRequestDTO,
  UpdateProfileRequestDTO,
} from '@nestjs-microservice/shared';

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
  updateUser(@Payload() dto: UpdateUserRequestDTO & { id: number; updated_by: string }) {
    return this.appService.updateUser({ ...dto, send_notification: false });
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
  updateUserProfile(@Payload() payload: UpdateProfileRequestDTO & { id: number; updated_by: string }) {
    return this.appService.updateUser({ ...payload, send_notification: true });
  }
}
