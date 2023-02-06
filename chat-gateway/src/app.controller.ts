import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { ChatSchema } from './mongo.model';

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

export class ChatRepository {
  db: SaveMessageForOffilneUser[] = [];

  constructor(
    @InjectModel('ChatSchema') private chatModel: Model<typeof ChatSchema>,
  ) {}

  saveMessageForUser(data: SaveMessageForOffilneUser) {
    this.db.push(data);
  }

  recoveryMessages(userId: string) {
    const recoveryMessages = this.db.filter((message) => {
      if (message.userId === userId) {
        return message;
      }
    });

    return recoveryMessages;
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
    socket.to(socketOfConnection?.socketId).emit('receive-message', {
      from: message.userId,
      to: message.connectionId,
      message: message.message,
    });
  }

  saveNewMessage(message: Message) {
    this.repository.saveMessageForUser({
      message: message.message,
      userId: message.connectionId,
      publisherId: message.userId,
    });
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

  getHistory(userId: string) {
    return this.repository.recoveryMessages(userId);
  }
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  connectedSockets: SocketConnected[] = [];

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('recovery')
  async recoveryHistory(socket: Socket, userId: string) {
    this.chatService.insertSocket(socket, userId);
    socket.emit('receive-history', this.chatService.getHistory(userId));
  }

  @SubscribeMessage('send-message')
  async saveNewMessage(socket: Socket, message: Message) {
    this.chatService.saveNewMessage(message);
    this.chatService.emitMessageForConnection(socket, message);
  }

  handleDisconnect(socket: Socket) {
    this.chatService.removeConnectedSocket(socket);
  }
}
