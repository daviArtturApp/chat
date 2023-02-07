import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatRepository } from '../schemas/typeOrm.schema';

interface SocketConnected {
   userId: string;
   socketId: string;
}

@Injectable()
export class ChatService {
   private connectedSockets: SocketConnected[] = [];

   constructor(private repository: ChatRepository) {}

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
