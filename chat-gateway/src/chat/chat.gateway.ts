import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { createWriteStream } from 'fs';
import { ChatService } from './chat.service';

interface SocketConnected {
  userId: string;
  socketId: string;
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
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
    await this.chatService.saveNewMessage(message);
    this.chatService.emitMessageForConnection(socket, message);
  }

  @SubscribeMessage('send-file')
  async handle(
    socket: Socket,
    data: { file: [Buffer, string]; to: number; from: number },
  ) {
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
