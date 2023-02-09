import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { createWriteStream } from 'fs';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

export interface SendMessageDto {
  to: number;
  from: number;
  content: string;
}

interface SendFileDto {
  file: [Buffer, string];
  to: number;
  from: number;
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  @SubscribeMessage('recovery')
  async recoveryHistory(socket: Socket, token: string) {
    const tokenPayload = this.decodeToken(token);
    this.chatService.insertSocket(socket, tokenPayload.id);
    socket.emit(
      'receive-history',
      await this.chatService.getHistory(tokenPayload.id),
    );
  }

  @SubscribeMessage('send-message')
  async saveNewMessage(socket: Socket, message: SendMessageDto) {
    //await this.chatService.saveNewMessage(message);
    this.chatService.emitMessageForConnection(socket, message);
  }

  @SubscribeMessage('send-file')
  async handle(socket: Socket, data: SendFileDto) {
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

  private decodeToken(token: string) {
    return this.jwtService.decode(token) as { id: string };
  }
}
