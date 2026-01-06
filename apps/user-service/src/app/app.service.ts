// apps/user-service/src/app/app.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

// DTOs
import {
  CreateUserRequestDTO,
  FilterUser,
  FindUserRequestDTO,
  UpdateUserRequestDTO,
} from '@nestjs-microservice/shared';
import { FirebaseService } from '@nestjs-microservice/firebase';

type UpdateUserPayload = UpdateUserRequestDTO & {
  id: number;
  send_notification?: boolean;
};

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService
  ) {}

  async createUser(payload: CreateUserRequestDTO) {
    try {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      await this.prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          role: payload.role || 'STAFF',
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

  async findAllUser(dto: FindUserRequestDTO) {
    // Parse query params
    const page = Math.max(1, Number(dto.page || 1));
    const limit = Math.min(Number(dto.limit || 10), 100);
    const skip = (page - 1) * limit;

    // Create filter
    const filters = {} as FilterUser;
    if (dto.name) {
      filters.name = {
        contains: dto.name,
      };
    }
    if (dto.position) {
      filters.position = dto.position;
    }

    try {
      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: {
            is_active: true,
            ...filters,
          },
          skip: skip,
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
          where: {
            is_active: true,
            ...filters,
          },
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

  async updateUser(payload: UpdateUserPayload) {
    const { id, password, send_notification, ...updateData } = payload;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          is_active: true,
        },
      });

      if (!user || !user.is_active) {
        return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      let hashedPassword: string | undefined;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          ...(password && { password: hashedPassword }),
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (send_notification) {
        try {
          await this.firebase.sendToTopic(
            'admin_profile_changes',
            'Profil Karyawan Diperbarui',
            `${updated.name} mengubah profil`,
            {
              type: 'profile_update',
              user_id: updated.id.toString(),
              timestamp: new Date().toISOString(),
            }
          );
        } catch (error) {
          console.error('Failed to send notification:', {
            userId: user.id,
            userName: user.name,
            error: error,
          });
        }
      }

      return { status: 'success', message: 'User updated successfully', data: null, meta: null };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }

  async deactivateUser(id: number) {
    try {
      const isUserExists = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!isUserExists || !isUserExists.is_active) {
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

  async getUserProfile(user_id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: user_id },
      select: {
        name: true,
        email: true,
        position: true,
        phone: true,
        photo_url: true,
      },
    });

    if (!user) {
      return { status: 'error', code: HttpStatus.NOT_FOUND, message: 'User not found', data: null, meta: null };
    }

    return { status: 'success', code: HttpStatus.OK, message: 'User retrieved successfully', data: user };
  }
}
