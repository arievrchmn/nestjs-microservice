import { Controller, Inject, HttpCode, Get, UseGuards, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

// DTOs
import type { FindAttendanceRequestDTO } from '@nestjs-microservice/shared';

@UseGuards(AuthGuard, RoleGuard)
@Controller('admin')
export class AdminAttendanceController {
  constructor(@Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy) {}

  @Get('attendances')
  @HttpCode(200)
  async findAllAttendance(@Query() dto: FindAttendanceRequestDTO) {
    return await firstValueFrom(this.attendanceClient.send('attendance.find_all', dto));
  }
}
