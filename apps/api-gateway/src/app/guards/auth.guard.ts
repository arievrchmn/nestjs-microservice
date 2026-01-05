import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Invalid authorization header', HttpStatus.UNAUTHORIZED);
    }
    try {
      const token = authHeader.split(' ')[1];
      const result = await firstValueFrom(this.authClient.send('auth.validate_token', token));
      if (!result.valid) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      req.user = { id: result.data.id, email: result.data.email, role: result.data.role };
      return true;
    } catch {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
