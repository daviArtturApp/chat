import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppController,
  ChatGateway,
  ChatRepository,
  ChatService,
} from './app.controller';
import { ChatSchema } from './mongo.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://root:root@cluster0.keevb0z.mongodb.net/?retryWrites=true&w=majority',
    ),
    MongooseModule.forFeature([{ name: 'ChatSchema', schema: ChatSchema }]),
  ],
  controllers: [AppController],
  providers: [ChatGateway, ChatRepository, ChatGateway, ChatService],
})
export class AppModule {}
