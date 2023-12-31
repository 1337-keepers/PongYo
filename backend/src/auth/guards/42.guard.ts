import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FortyTwoGuard extends AuthGuard('42') {
  handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
