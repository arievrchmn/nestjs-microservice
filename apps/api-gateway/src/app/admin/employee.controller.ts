// apps/api-gateway/src/app/admin/admin.controller.ts

import { Controller, Post, Body, Inject, Param, Patch, Delete, Get, Query, HttpCode } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('admin')
export class AdminEmployeeController {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  @Post('employees')
  @HttpCode(201)
  async createEmployee(@Body() body: any) {
    return await firstValueFrom(this.userClient.send('user.create', body));
  }

  @Get('employees')
  @HttpCode(200)
  async findAllEmployees(@Query() query: { page?: string; limit?: string }) {
    return await firstValueFrom(this.userClient.send('users.find_all', query));
  }

  @Patch('employees/:id')
  @HttpCode(200)
  async updateEmployee(@Body() body: any, @Param('id') id: string) {
    return await firstValueFrom(this.userClient.send('user.update', { ...body, id }));
  }

  @Delete('employees/:id')
  @HttpCode(200)
  async deactivateEmployee(@Param('id') id: string) {
    return await firstValueFrom(this.userClient.send('user.deactivate', { id }));
  }
}
