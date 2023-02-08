import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { AuthenticationService } from 'src/application/services/authentication.service';
import { AuthUserDto } from '../dtos/AuthUser.dto';
import { JwtAuthGuard } from '../guards/local-auth.guard';
import { Role } from '../interceptors/role.interceptor';
import { Request } from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthenticationService) {}

  @Post()
  async handleCredentials(@Body() dto: AuthUserDto) {
    const token = await this.authService.authenticate(dto.email, dto.password);
    return { token };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new Role('USER'))
  @Get()
  decode(@Req() res: Request) {
    return res.user;
  }
}
