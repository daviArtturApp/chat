import {
  CallHandler,
  Controller,
  ExecutionContext,
  Get,
  NestInterceptor,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { Request as RequestExpress } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './local-auth.guard';

interface Request extends RequestExpress {
  user: {
    userId: string;
    role: string;
  };
}

class Role implements NestInterceptor {
  constructor(private role: string) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user, this.role);
    if (this.role !== user.role) {
      await this.throw403();
    }

    const now = Date.now();
    return next.handle();
  }

  private async throw403() {
    throw new UnauthorizedException();
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  @Post()
  async handleCredentials() {
    const userData = await this.authService.compareCredentials();
    return this.jwtService.sign(userData);
  }

  @UseInterceptors(new Role('USER'))
  @UseGuards(JwtAuthGuard)
  @Get()
  decode(@Req() res: Request) {
    console.log('aqui');
    return res.user;
  }
}

function asd() {
  console.log('interceptou');
}
