import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatRepository, ChatSchema } from './mongo.model';

interface Message {
  userId: string;
  connectionId: string;
  message: string;
}

interface SocketOfUsers {
  userId: string;
  socketId: string;
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway {
  constructor(private repository: ChatRepository) {}

  @SubscribeMessage('recovery')
  async recoveryHistory(socket: Socket, connectionId: string) {
    const history = await this.repository.getHistory({
      socketId: socket.id,
      connectionId,
    });

    console.log(history);
  }

  @SubscribeMessage('send-message')
  async saveNewMessage(socket: Socket, message: Message) {
    const conversation = await this.repository.saveMessage({
      ...message,
      socketId: socket.id,
    });

    console.log(conversation);
  }
}
@WebSocketGateway(3001, { cors: { origin: '*' } })
export class AppController {
  db: SocketOfUsers[] = [];

  constructor(
    @InjectModel('ChatSchema') private model: typeof ChatSchema,
    repository: ChatRepository,
  ) {}

  @WebSocketServer()
  private server: Socket;

  @SubscribeMessage('register')
  register(currentSocket: Socket, userId: string) {
    const userHaveScoket = this.db.findIndex(
      (socket) => socket.userId === userId,
    );

    if (userHaveScoket === -1) {
      this.db.push({
        socketId: currentSocket.id,
        userId,
      });
    } else {
      this.db[userHaveScoket].socketId = currentSocket.id;
    }

    console.log(this.db);
  }

  @SubscribeMessage('send-message')
  handleSendMessage(socket: Socket, message: Message) {
    console.log(message);
    console.log(this.db);

    this.db.map((socket) => {
      if (socket.userId === message.connectionId) {
        console.log(`O user ${message.userId} enviou para ${socket.userId}`);
        this.server.to(socket.socketId).emit('receive-message', message);
      }
    });
  }
}
