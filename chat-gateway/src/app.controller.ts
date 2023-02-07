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
import { ChatRepositoryy } from './schemas/typeOrm.schema';

interface Message {
   to: string;
   from: string;
   content: string;
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

interface SocketConnected {
   userId: string;
   socketId: string;
}

@Injectable()
export class ChatService {
   private connectedSockets: SocketConnected[] = [];

   constructor(private repository: ChatRepositoryy) {}

   emitMessageForConnection(
      socket: Socket,
      message: { to: number; from: number; content: string },
   ) {
      const socketOfConnection = this.connectedSockets.find(
         (socket) => socket.userId === message.from.toString(),
      );

      socket.to(socketOfConnection?.socketId).emit('receive-message', {
         from: message.to,
         to: message.from,
         message: message.content,
         type: 'string',
      });
   }

   async saveNewMessage(message: {
      to: number;
      from: number;
      content: string;
   }) {
      await this.repository.saveMessageForUser({
         content: message.content,
         from: message.from.toString(),
         to: message.to.toString(),
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

   emitFileForConnection(
      socket: Socket,
      data: {
         content: string;
         to: number;
         from: number;
      },
   ) {
      const socketOfConnection = this.connectedSockets.find(
         (socket) => socket.userId === data.from.toString(),
      );

      socket.to(socketOfConnection?.socketId).emit('receive-message', {
         from: data.to,
         to: data.from,
         message: data.content,
         type: 'file',
      });
   }

   async getHistory(userId: string) {
      return await this.repository.recoveryMessages(userId);
   }

   async saveFile(filePath: string, to: string, from: string) {
      return await this.repository.saveFile({
         content: filePath,
         to,
         from,
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
   async saveNewMessage(
      socket: Socket,
      message: { to: number; from: number; content: string },
   ) {
      message.from = message.from - message.to;

      await this.chatService.saveNewMessage(message);
      this.chatService.emitMessageForConnection(socket, message);
   }

   @SubscribeMessage('send-file')
   async handle(
      socket: Socket,
      data: { file: [Buffer, string]; to: number; from: number },
   ) {
      data.from = data.from - data.to;
      createWriteStream(`./uploads/${data.file[1]}`).write(data.file[0]);

      await this.chatService.saveFile(
         data.file[1],
         data.to.toString(),
         data.from.toString(),
      );

      this.chatService.emitFileForConnection(socket, {
         ...data,
         content: data.file[1],
      });
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
