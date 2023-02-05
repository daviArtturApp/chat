import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './app.controller';
import { AppService } from './app.service';
import { ChatRepository, ChatSchema } from './mongo.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://root:root@cluster0.keevb0z.mongodb.net/?retryWrites=true&w=majority',
    ),
    MongooseModule.forFeature([{ name: 'ChatSchema', schema: ChatSchema }]),
  ],
  controllers: [],
  providers: [AppService, ChatGateway, ChatRepository],
})
export class AppModule {}
