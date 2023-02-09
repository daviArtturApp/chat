import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { Chat, ChatRepository } from './schemas/typeOrm.schema';
import { AuthModule } from './infra/modules/auth.module';
import {
  UserEntity,
  UserRepositoryInfra,
} from './infra/repositories/user.repository';
import { AuthStrategy } from './infra/strategy/auth.strategy';
import { AuthenticationService } from './application/services/authentication.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './infra/controllers/auth.controller';
import { HashService } from './application/services/hash.service';
import { BcryptAdapter } from './infra/adapters/Bcrypt.adapter';
import * as bcrypt from 'bcrypt';
import { AppController } from './app.controller';
import { TokenService } from './application/services/Token.service';
import { JwtAdapter } from './infra/adapters/Jwt.adapter';

@Module({
  imports: [
    JwtModule.register({
      secret: '123123123123123',
      signOptions: { expiresIn: '1h' },
    }),
    //AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './mydb.sql',
      synchronize: true,
      entities: [Chat, UserEntity],
    }),
    TypeOrmModule.forFeature([UserEntity, Chat]),
    AuthModule,
  ],
  controllers: [AuthController, AppController],
  providers: [
    ChatGateway,
    ChatService,
    ChatRepository,
    AuthStrategy,
    UserRepositoryInfra,
    AuthenticationService,
    {
      provide: HashService,
      useValue: new HashService(new BcryptAdapter(bcrypt)),
    },
    {
      provide: TokenService,
      useValue: new TokenService(
        new JwtAdapter(
          new JwtService({
            secret: '123123123123123',
          }),
        ),
      ),
    },
  ],
})
export class AppModule {}
