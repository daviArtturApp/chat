import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from 'src/application/services/authentication.service';
import { AuthUserDto } from '../dtos/AuthUser.dto';
import { JwtAuthGuard } from '../guards/local-auth.guard';
import { Role } from '../interceptors/role.interceptor';
import { Request } from '../interfaces';
import { UserRepositoryInfra } from '../repositories/user.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthenticationService,
    private repo: UserRepositoryInfra,
  ) {}

  @Post()
  async handleCredentials(@Body() dto: AuthUserDto) {
    const token = await this.authService.authenticate(dto.email, dto.password);
    return { token };
  }

  @Get('/users')
  async getAllUsers() {
    return await this.repo.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new Role('USER'))
  @Get()
  decode(@Req() res: Request) {
    return res.user;
  }
}
