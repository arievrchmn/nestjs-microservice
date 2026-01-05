import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './app.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService
  ) {}

  async login(payload: { email: string; password: string }) {
    const response = await firstValueFrom(this.userClient.send('user.auth.find_by_email', payload.email));
    if (!response.data || !response.data.is_active) {
      return { status: response.status, code: HttpStatus.BAD_REQUEST, message: 'Email or Password is incorrect' };
    }

    const valid = await bcrypt.compare(payload.password, response.data.password);
    if (!valid) {
      return { status: 'error', code: HttpStatus.BAD_REQUEST, message: 'Email or Password is incorrect' };
    }

    const signUser = {
      sub: response.data.id,
      email: response.data.email,
      role: response.data.role,
    };

    const token = this.jwtService.sign(signUser, { secret: jwtSecret });
    return {
      status: 'success',
      message: 'Login success',
      data: { access_token: token },
    };
  }

  validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: jwtSecret });
      const { sub, ...rest } = decoded;
      return { valid: true, data: { id: sub, ...rest } };
    } catch {
      return { valid: false, data: null };
    }
  }
}
