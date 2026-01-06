import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

// DTOs
import type { FindAttendanceRequestDTO } from '@nestjs-microservice/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('attendance.staff.today')
  today(@Payload() payload: { user_id: number }) {
    return this.appService.today(payload);
  }

  @MessagePattern('attendance.staff.check_in')
  checkIn(@Payload() payload: { user_id: number }) {
    return this.appService.checkIn(payload);
  }

  @MessagePattern('attendance.staff.check_out')
  checkOut(@Payload() payload: { user_id: number }) {
    return this.appService.checkOut(payload);
  }

  @MessagePattern('attendance.staff.summary')
  summary(@Payload() payload: any) {
    return this.appService.summary(payload);
  }

  @MessagePattern('attendance.admin.find_all')
  findAllAttendance(@Payload() dto: FindAttendanceRequestDTO) {
    return this.appService.findAllAttendance(dto);
  }
}
