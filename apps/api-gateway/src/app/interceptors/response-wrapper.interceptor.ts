import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

interface WrappedResponse {
  success: boolean;
  message: any;
  data: any;
  meta?: any;
}

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((res) => {
        if (res?.status && res?.code) {
          if (res.status === 'error') {
            throw new HttpException(res.message, res.code);
          }
        }

        const response: WrappedResponse = {
          success: true,
          message: 'OK',
          data: res.data,
        };
        if (res.meta) {
          response.meta = res.meta;
        }
        return response;
      })
    );
  }
}
