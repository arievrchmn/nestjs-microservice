// apps/api-gateway/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AdminEmployeeController } from './admin/employee.controller';

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
    ]),
    JwtModule.register({
      secret: 'your_jwt_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, AdminEmployeeController],
})
export class AppModule {}
