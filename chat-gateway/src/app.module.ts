import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController, ChatGateway, ChatService } from './app.controller';
import { Chat, ChatRepositoryy } from './schemas/typeOrm.schema';

@Module({
   imports: [
      // MongooseModule.forRoot(
      //   'mongodb+srv://root:root@cluster0.keevb0z.mongodb.net/?retryWrites=true&w=majority',
      // ),
      // MongooseModule.forFeature([{ name: 'ChatSchema', schema: ChatSchema }]),
      TypeOrmModule.forRoot({
         type: 'sqlite',
         database: './mydb.sql',
         synchronize: true,
         entities: [Chat],
      }),
      TypeOrmModule.forFeature([Chat]),
   ],
   controllers: [AppController],
   providers: [
      ChatGateway,
      // ChatRepository,
      ChatGateway,
      ChatService,
      ChatRepositoryy,
   ],
})
export class AppModule {}
