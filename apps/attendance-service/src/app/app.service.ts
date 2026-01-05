// apps/attendance-service/src/app/app.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// DTOs
import type { FindAttendanceRequestDTO } from '@nestjs-microservice/shared';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  private startOfToday() {
    return dayjs().tz('Asia/Jakarta').startOf('day').utc(true).toDate();
  }

  async today(payload: { user_id: number }) {
    const today = this.startOfToday();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: payload.user_id,
          date: today,
        },
      },
      select: {
        id: true,
        date: true,
        check_in: true,
        check_out: true,
      },
    });

    if (!attendance) {
      return {
        status: 'success',
        data: { attendance: null, can_check_in: true, can_check_out: false },
      };
    }

    return {
      status: 'success',
      data: {
        attendance,
        can_check_in: false,
        can_check_out: !!(attendance.check_in && !attendance.check_out),
      },
    };
  }

  async checkIn(payload: { user_id: number }) {
    const today = this.startOfToday();
    const now = new Date();

    const existing = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: payload.user_id,
          date: today,
        },
      },
    });

    if (existing?.check_in) {
      return { status: 'error', code: HttpStatus.BAD_REQUEST, message: 'You have already checked in today' };
    }

    const attendance = await this.prisma.attendance.upsert({
      where: {
        user_id_date: {
          user_id: payload.user_id,
          date: today,
        },
      },
      update: {
        check_in: now,
      },
      create: {
        user_id: payload.user_id,
        date: today,
        check_in: now,
      },
      select: {
        id: true,
        date: true,
        check_in: true,
        check_out: true,
      },
    });

    return {
      status: 'success',
      message: 'Check-in successful',
      data: attendance,
    };
  }

  async checkOut(payload: { user_id: number }) {
    const today = this.startOfToday();
    const now = new Date();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: payload.user_id,
          date: today,
        },
      },
    });

    // User has not checked in today
    if (!attendance) {
      return { status: 'error', code: HttpStatus.BAD_REQUEST, message: 'You have not checked in today' };
    }

    // attendance exists but check-in is missing
    if (!attendance.check_in) {
      return { status: 'error', code: HttpStatus.BAD_REQUEST, message: 'Invalid attendance data' };
    }

    // User has already checked out
    if (attendance.check_out) {
      return { status: 'error', code: HttpStatus.BAD_REQUEST, message: 'You have already checked out today' };
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        check_out: now,
      },
      select: {
        id: true,
        date: true,
        check_in: true,
        check_out: true,
      },
    });

    return {
      status: 'success',
      message: 'Check-out successful',
      data: updated,
    };
  }

  async summary(payload: {
    user_id: number;
    start_date?: Date | string;
    end_date?: Date | string;
    page?: string | number;
    limit?: string | number;
  }) {
    try {
      const now = dayjs.utc();
      const startDate = payload.start_date ? dayjs.utc(payload.start_date).startOf('day') : now.startOf('month');
      const endDate = payload.end_date ? dayjs.utc(payload.end_date).endOf('day') : now.endOf('day');

      // Pagination
      const page = Math.max(1, Number(payload.page || 1));
      const limit = Math.min(Number(payload.limit || 10), 50);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.attendance.findMany({
          where: {
            user_id: payload.user_id,
            date: { gte: startDate.toDate(), lte: endDate.toDate() },
          },
          orderBy: { date: 'asc' },
          skip,
          take: limit,
          select: {
            id: true,
            date: true,
            check_in: true,
            check_out: true,
          },
        }),
        this.prisma.attendance.count({
          where: {
            user_id: payload.user_id,
            date: { gte: startDate.toDate(), lte: endDate.toDate() },
          },
        }),
      ]);

      return {
        status: 'success',
        message: 'Attendance summary retrieved successfully',
        data,
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error(err);
      return {
        status: 'error',
        code: 500,
        message: 'An unexpected error occurred',
      };
    }
  }

  async findAllAttendance(dto: FindAttendanceRequestDTO) {
    // Parse query params
    const page = Math.max(1, Number(dto.page || 1));
    const limit = Math.min(Number(dto.limit || 10), 100);
    const skip = (page - 1) * limit;

    // Create filter
    const filters: any = {};
    const userFilters: any = {};

    if (dto.start_date && dto.end_date) {
      const startDate = dto.start_date ? dayjs.utc(dto.start_date).startOf('day').toDate() : undefined;

      const endDate = dto.end_date ? dayjs.utc(dto.end_date).endOf('day').toDate() : undefined;
      filters.date = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
    }

    if (dto.name) {
      userFilters.name = {
        contains: dto.name,
      };
    }

    if (dto.position) {
      userFilters.position = dto.position;
    }

    if (Object.keys(userFilters).length > 0) {
      filters.user = userFilters;
    }
    try {
      const limit = Math.min(Number(dto.limit || 10), 50);

      const [attendances, total] = await this.prisma.$transaction([
        this.prisma.attendance.findMany({
          where: filters,
          skip: skip,
          take: limit,
          select: {
            id: true,
            date: true,
            check_in: true,
            check_out: true,
            user: {
              select: {
                name: true,
                position: true,
              },
            },
          },
        }),
        this.prisma.attendance.count({ where: filters }),
      ]);

      return {
        status: 'success',
        message: 'Attendances retrieved successfully',
        data: attendances,
        meta: {
          total,
          page: dto.page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch {
      return { status: 'error', code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
    }
  }
}
