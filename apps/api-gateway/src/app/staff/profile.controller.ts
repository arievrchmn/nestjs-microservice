import { Controller, Inject, HttpCode, UseGuards, Body, Patch, Get, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('staff')
export class StaffProfileController {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  @Get('profile')
  @HttpCode(200)
  async getProfile(@Req() req: any) {
    const user_id = req.user.id;
    return await firstValueFrom(this.userClient.send('user.staff.get_profile', user_id));
  }

  @Patch('profile')
  @HttpCode(200)
  async updateProfile(
    @Req() req: any,
    @Body() body: { token?: string; photoUrl?: string; phone?: string; password?: string }
  ) {
    const user_id = req.user.id;
    return await firstValueFrom(this.userClient.send('user.staff.update_profile', { id: user_id, ...body }));
  }
}
