import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import { finalize, type Observable } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = `${context.getClass().name}.${context.getHandler().name}`;
    const start = performance.now();

    return next.handle().pipe(
      finalize(() => {
        this.logger.debug(
          `${handler} took ${(performance.now() - start).toFixed(1)}ms`,
        );
      }),
    );
  }
}
