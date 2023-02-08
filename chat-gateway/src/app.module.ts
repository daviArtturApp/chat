import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { Chat, ChatRepository } from './schemas/typeOrm.schema';
import { AuthModule } from './infra/modules/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './mydb.sql',
      synchronize: true,
      entities: [Chat],
    }),
    TypeOrmModule.forFeature([Chat]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [ChatGateway, ChatService, ChatRepository],
})
export class AppModule {}
