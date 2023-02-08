import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationService } from 'src/application/services/authentication.service';
import { HashService } from 'src/application/services/hash.service';
import { UserRepository } from 'src/domain/contracts/repositories';
import { User } from 'src/domain/entity/User';
import { AuthController } from '../controllers/auth.controller';
import { AuthStrategy } from '../strategy/auth.strategy';
import { BcryptAdapter } from '../adapters/Bcrypt.adapter';
import * as bcrypt from 'bcrypt';
class UserRepositoryInfra implements UserRepository {
  async findOneByEmail(email: string): Promise<User> {
    return new User({
      email,
      id: '123123',
      name: 'user123',
      number: '1231231231',
      password: '$2b$10$jz7X3M7oP2tnAgN71/uyvOPGOWqWslNmcnsfuqrOKOhDsurqKP3WO',
    });
  }
}
@Module({
  imports: [
    JwtModule.register({
      secret: '123123123123123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthStrategy,
    {
      provide: AuthenticationService,
      useValue: new AuthenticationService(
        new UserRepositoryInfra(),
        new HashService(new BcryptAdapter(bcrypt)),
        new JwtService({
          secret: '123123123123123',
        }),
      ),
    },
  ],
})
export class AuthModule {}
