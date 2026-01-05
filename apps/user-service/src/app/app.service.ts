// apps/user-service/src/app/app.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { User as UserModel } from '../generated/prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createUser(payload: any) {
    try {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      await this.prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role,
          name: payload.name,
          phone: payload.phone,
          photo_url: payload.photoUrl,
          position: payload.position,
        },
      });

      return {
        status: 'success',
        message: 'User created successfully',
        data: null,
        meta: null,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return { status: 'error', code: HttpStatus.CONFLICT, message: 'User already exists' };
      }
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }

  async findAllUsers(query: { page?: string; limit?: string }) {
    try {
      const page = Math.max(1, Number(query.page || 1));
      const limit = Math.min(Number(query.limit || 10), 50);
      const skip = (page - 1) * limit;

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: {
            is_active: true,
          },
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            role: true,
            is_active: true,
            name: true,
            phone: true,
            photo_url: true,
            position: true,
          },
        }),
        this.prisma.user.count({
          where: { is_active: true },
        }),
      ]);

      return {
        status: 'success',
        message: 'Users retrieved successfully',
        data: users,
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }

  async updateUser(id: number, updateData: Partial<UserModel>) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user || !user.is_active) {
        return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      return { status: 'success', message: 'User updated successfully', data: null, meta: null };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }

  async deactivateUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user || !user.is_active) {
        return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      await this.prisma.user.update({
        where: { id },
        data: { is_active: false },
      });

      return {
        status: 'success',

        message: 'User deactivated successfully',
        data: null,
        meta: null,
      };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }

  async findAuthUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email, is_active: true },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          name: true,
          phone: true,
          photo_url: true,
          position: true,
        },
      });

      if (!user) {
        return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'User not found', data: null, meta: null };
      }

      return { status: 'success', message: 'User retrieved successfully', data: user, meta: null };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }
}
