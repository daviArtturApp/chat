import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

const ConnectionsChatSchema = new Schema({
  connectionId: String,
  messages: [String],
});

export const ChatSchema = new Schema({
  socketId: String,
  chats: [ConnectionsChatSchema],
});

interface SaveMessageDto {
  socketId: string;
  message: string;
  connectionId: string;
}

interface GetChatHistoryDto {
  socketId: string;
  connectionId: string;
}

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel('ChatSchema') private chatModel: Model<typeof ChatSchema>,
  ) {}

  async saveMessage(dto: SaveMessageDto) {
    const chat = await this.chatModel.findOne({ socketId: dto.socketId });
    console.log(chat);
  }

  async getHistory(dto: GetChatHistoryDto) {
    const history = await this.chatModel
      .findOne({ socketId: dto.socketId })
      .exec();
    console.log(history);
  }

  async createChat(dto: SaveMessageDto) {
    const result = await this.chatModel.create({
      socketId: dto.socketId,
      conversations: [
        {
          connectionId: dto.connectionId,
          messages: [dto.message],
        },
      ],
    });

    console.log(result);
  }
}
