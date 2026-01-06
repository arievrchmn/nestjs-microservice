import { Controller, Inject, HttpCode, Get, UseGuards, Req, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('staff')
export class StaffAttendanceController {
  constructor(@Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy) {}

  @Get('attendance/today')
  @HttpCode(200)
  async today(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.staff.today', payload));
  }

  @Post('attendance/check-in')
  @HttpCode(200)
  async checkIn(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.staff.check_in', payload));
  }

  @Post('attendance/check-out')
  @HttpCode(200)
  async checkOut(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.staff.check_out', payload));
  }

  @Get('attendance/summary')
  @HttpCode(200)
  async getSummary(
    @Req() req: any,
    @Query() query: { page?: string; limit?: string; start_date?: string; end_date?: string }
  ) {
    const payload = {
      user_id: req.user.id,
      ...query,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.staff.summary', payload));
  }
}
