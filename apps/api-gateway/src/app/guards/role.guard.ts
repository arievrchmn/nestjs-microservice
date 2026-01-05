import { CanActivate, ExecutionContext, Injectable, HttpStatus, HttpException } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
