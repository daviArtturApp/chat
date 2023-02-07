import { Injectable, Get, Param, Controller, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { ChatSchema } from './mongo.model';
import { Response } from 'express';
import { createWriteStream } from 'fs';

interface Message {
  userId: string;
  connectionId: string;
  message: string;
}

interface SaveMessageForOffilneUser {
  userId: string;
  publisherId: string;
  message: string;
}

interface Messages {
  type: MessageType;
  content: string;
}

interface IUser {
  userId: string;
  connections: [
    {
      connectionId: string;
      messages: Messages[];
    },
  ];
}
type MessageType = 'file' | 'string';

export class ChatRepository {
  db: SaveMessageForOffilneUser[] = [];

  constructor(
    @InjectModel('ChatSchema') private chatModel: Model<typeof ChatSchema>,
  ) {}

  async saveMessageForUser(data: SaveMessageForOffilneUser, type: MessageType) {
    const exist = (await this.chatModel
      .findOne({ userId: data.userId })
      .exec()) as any as IUser;

    if (exist) {
      let updatedMessageConnection = false;
      let i = 0;
      while (i < exist.connections.length) {
        const currentConnection = exist.connections[i];
        if (currentConnection.connectionId === data.publisherId) {
          console.log('AQUI');
          currentConnection.messages.push({ content: data.message, type });
          updatedMessageConnection = true;
          await this.chatModel.updateOne({ userId: data.userId }, exist);
        }
        i++;
      }

      if (updatedMessageConnection) {
        return;
      }

      exist.connections.push({
        connectionId: data.publisherId,
        messages: [{ content: data.message, type }],
      });

      await this.chatModel.updateOne({ userId: data.userId }, exist);
      return;
    }

    await this.chatModel.create({
      userId: data.userId,
      connections: [
        {
          connectionId: data.publisherId,
          messages: [{ content: data.message, type }],
        },
      ],
    });

    console.log(exist);

    // this.db.push(data);
  }

  async recoveryMessages(userId: string) {
    const recoveryMessages = await this.chatModel.findOne({ userId });

    return recoveryMessages;
  }

  async saveFile(data: SaveMessageForOffilneUser) {
    const exist = (await this.chatModel
      .findOne({ userId: data.userId })
      .exec()) as any as IUser;

    if (exist) {
      let updatedMessageConnection = false;
      let i = 0;
      while (i < exist.connections.length) {
        const currentConnection = exist.connections[i];
        if (currentConnection.connectionId === data.publisherId) {
          console.log('AQUI');
          currentConnection.messages.push({
            content: data.message,
            type: 'file',
          });
          updatedMessageConnection = true;
          await this.chatModel.updateOne({ userId: data.userId }, exist);
        }
        i++;
      }

      if (updatedMessageConnection) {
        return;
      }

      exist.connections.push({
        connectionId: data.publisherId,
        messages: [{ content: data.message, type: 'file' }],
      });

      await this.chatModel.updateOne({ userId: data.userId }, exist);
      return;
    }
  }
}

interface SocketConnected {
  userId: string;
  socketId: string;
}

@Injectable()
export class ChatService {
  private connectedSockets: SocketConnected[] = [];

  constructor(private repository: ChatRepository) {}

  emitMessageForConnection(socket: Socket, message: Message) {
    const socketOfConnection = this.connectedSockets.find(
      (socket) => socket.userId === message.connectionId,
    );
    console.log(this.connectedSockets);
    socket.to(socketOfConnection?.socketId).emit('receive-message', {
      from: message.userId,
      to: message.connectionId,
      message: message.message,
    });
  }

  async saveNewMessage(message: Message, type: MessageType) {
    await this.repository.saveMessageForUser(
      {
        message: message.message,
        userId: message.connectionId,
        publisherId: message.userId,
      },
      type,
    );
  }

  insertSocket(socket: Socket, userId: string) {
    this.connectedSockets.push({
      socketId: socket.id,
      userId,
    });
  }

  removeConnectedSocket(socket: Socket) {
    this.connectedSockets = this.connectedSockets.filter(
      (client) => client.socketId !== socket.id,
    );
  }

  async getHistory(userId: string) {
    return await this.repository.recoveryMessages(userId);
  }

  async saveFile(filePath: string, publisherId: string, userId: string) {
    return await this.repository.saveFile({
      message: filePath,
      publisherId,
      userId,
    });
  }
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  connectedSockets: SocketConnected[] = [];

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('recovery')
  async recoveryHistory(socket: Socket, userId: string) {
    this.chatService.insertSocket(socket, userId);
    socket.emit('receive-history', await this.chatService.getHistory(userId));
  }

  @SubscribeMessage('send-message')
  async saveNewMessage(socket: Socket, message: Message) {
    await this.chatService.saveNewMessage(message, 'string');
    this.chatService.emitMessageForConnection(socket, message);
  }

  @SubscribeMessage('send-file')
  async handle(
    socket: Socket,
    data: { file: [Buffer, string]; userId: string; publisherId: string },
  ) {
    await this.chatService.saveFile(
      data.file[1],
      data.publisherId,
      data.userId,
    );
    createWriteStream(`./uploads/${data.file[1]}`).write(data.file[0]);
  }

  handleDisconnect(socket: Socket) {
    this.chatService.removeConnectedSocket(socket);
  }
}

@Controller()
export class AppController {
  @Get(':path')
  getFile(@Param('path') path: string, @Res() res: Response) {
    return res.sendFile(
      `C:/Users/App Marketing/Desktop/code/chat-gateway/uploads/${path}`,
    );
  }
}
