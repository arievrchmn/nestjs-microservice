// apps/attendance-service/src/app/app.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
// import { Attendance as AttendanceModel } from '@nestjs-microservice/shared';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  private startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async today(payload: { user_id: number }) {
    const today = this.startOfToday();

    const data = {
      attendance: null,
      can_check_in: true,
      can_check_out: false,
    } as any;

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
      return { status: 'success', data };
    }

    data.attendance = attendance;

    if (attendance.check_in) {
      if (!attendance.check_out) {
        data.can_check_in = false;
        data.can_check_out = true;
      } else {
        data.can_check_in = false;
        data.can_check_out = false;
      }
    }
    return { status: 'success', data };
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
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Parse dates
      const startDate = payload.start_date ? new Date(payload.start_date) : startOfMonth;
      const endDate = payload.end_date ? new Date(payload.end_date) : now;

      // Pagination
      const page = Math.max(1, Number(payload.page || 1));
      const limit = Math.min(Number(payload.limit || 10), 50);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.attendance.findMany({
          where: {
            user_id: payload.user_id,
            date: { gte: startDate, lte: endDate },
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
            date: { gte: startDate, lte: endDate },
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
}
