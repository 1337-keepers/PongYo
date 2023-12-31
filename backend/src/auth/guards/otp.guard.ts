import { RedisService } from '@/redis/redis.service';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../auth.constants';

@Injectable()
export class OptAuthGuard extends AuthGuard('jwt') {
  constructor(private redisService: RedisService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req: Request = context.switchToHttp().getRequest();

    const accessToken = req.cookies[AUTH_COOKIE_NAME] as string | null;

    const otpNeeded = await this.redisService.hget(
      `token-${accessToken}`,
      'otp-needed',
    );

    if (otpNeeded === '0') throw new UnauthorizedException();

    return true;
  }

  handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
