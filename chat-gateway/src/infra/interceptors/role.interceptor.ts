import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleEnum } from 'src/domain/interface';
import { Request } from '../interfaces';

export class Role implements NestInterceptor {
  constructor(private role: string) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    return await this.handle(context, next);
  }

  private async handle(context: ExecutionContext, next: CallHandler) {
    const request = this.getRequest(context);
    const user = request.user;
    await this.compareRole(user.role);
    return next.handle();
  }

  private async compareRole(userRole: RoleEnum) {
    if (this.role !== userRole) {
      await this.throw403();
    }
  }

  private async throw403() {
    throw new UnauthorizedException();
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }
}
