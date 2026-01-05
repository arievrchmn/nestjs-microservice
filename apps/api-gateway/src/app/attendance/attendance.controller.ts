import { Controller, Inject, HttpCode, Get, UseGuards, Req, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(@Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy) {}

  @Get('today')
  @HttpCode(200)
  async today(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.today', payload));
  }

  @Post('check-in')
  @HttpCode(200)
  async checkIn(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.check_in', payload));
  }

  @Post('check-out')
  @HttpCode(200)
  async checkOut(@Req() req: any) {
    const payload = {
      user_id: req.user.id,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.check_out', payload));
  }

  @Get('summary')
  @HttpCode(200)
  async getSummary(
    @Req() req: any,
    @Query() query: { page?: string; limit?: string; start_date?: string; end_date?: string }
  ) {
    const payload = {
      user_id: req.user_id,
      ...query,
    };
    return await firstValueFrom(this.attendanceClient.send('attendance.summary', payload));
  }
}
