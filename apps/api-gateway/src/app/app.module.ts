// apps/api-gateway/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AdminUserController } from './admin/user.controller';
import { StaffAttendanceController } from './staff/attendance.controller';
import { AdminAttendanceController } from './admin/attendance.controller';
import { ConfigModule } from '@nestjs/config';
import { StaffProfileController } from './staff/profile.controller';

export const jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'ATTENDANCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3003,
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
    }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthController,
    AdminUserController,
    AdminAttendanceController,
    StaffAttendanceController,
    StaffProfileController,
  ],
})
export class AppModule {}
