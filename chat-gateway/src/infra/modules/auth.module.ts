import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationService } from 'src/application/services/authentication.service';
import { HashService } from 'src/application/services/hash.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthStrategy } from '../strategy/auth.strategy';
import { BcryptAdapter } from '../adapters/Bcrypt.adapter';
import * as bcrypt from 'bcrypt';
import {
  UserEntity,
  UserRepositoryInfra,
} from '../repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    JwtModule.register({
      secret: '123123123123123',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthStrategy,
    UserRepositoryInfra,
    AuthenticationService,
    JwtService,
    {
      provide: HashService,
      useValue: new BcryptAdapter(bcrypt),
    },
    // {
    //   provide: AuthenticationService,
    //   useValue: new AuthenticationService(
    //     new UserRepositoryInfra(
    //       new Repository(
    //         UserEntity,
    //         new EntityManager(
    //           new DataSource({
    //             type: 'sqlite',
    //             database: './mydb.sql',
    //             synchronize: true,
    //             entities: [UserEntity],
    //           }),
    //         ),
    //       ),
    //     ),
    //     new HashService(new BcryptAdapter(bcrypt)),
    //     new JwtService({
    //       secret: '123123123123123',
    //     }),
    //   ),
    // },
  ],
})
export class AuthModule {}
