import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { JwtAuthGuard } from '../guards/local-auth.guard';
import { Role } from '../interceptors/role.interceptor';
import { Request } from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post()
  async handleCredentials() {
    //const userData = await this.authService.compareCredentials();
    //return this.jwtService.sign(userData);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new Role('USER'))
  @Get()
  decode(@Req() res: Request) {
    console.log('aqui');
    return res.user;
  }
}
