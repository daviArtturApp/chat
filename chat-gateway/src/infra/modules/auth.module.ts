import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/auth.controller';
import { AuthStrategy } from '../strategy/auth.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: '123123123123123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthStrategy],
})
export class AuthModule {}
