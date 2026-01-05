// apps/api-gateway/src/app/admin/admin.controller.ts

import { Controller, Post, Body, Inject, Param, Patch, Delete, Get, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

// DTOs
import type { FindEmployeeRequestDTO } from '@nestjs-microservice/shared';

@UseGuards(AuthGuard, RoleGuard)
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
  async findAllEmployee(@Query() dto: FindEmployeeRequestDTO) {
    return await firstValueFrom(this.userClient.send('users.find_all', dto));
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
