import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

interface Message {
  userId: string;
  connectionId: string;
  message: string;
}

interface SocketOfUsers {
  userId: string;
  socketId: string;
}

interface SaveMessageForOffilneUser {
  userId: string;
  publisherId: string;
  message: string;
}

class ChatRepository {
  db: SaveMessageForOffilneUser[] = [];

  saveMessageForUser(data: SaveMessageForOffilneUser) {
    this.db.push(data);
  }

  recoveryMessages(userId: string) {
    const recoveryMessages = this.db.filter((message) => {
      if (message.userId === userId) {
        return message;
      }
    });
    console.log(this.db);

    // this.db = this.db.filter((message) => {
    //   if (message.userId !== userId) {
    //     return message;
    //   }
    // });

    return recoveryMessages;
  }
}

interface SocketConnected {
  userId: string;
  socketId: string;
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  connectedSockets: SocketConnected[] = [];
  repository = new ChatRepository();

  @SubscribeMessage('recovery')
  async recoveryHistory(socket: Socket, userId: string) {
    const recoveredMessages = this.repository.recoveryMessages(userId);
    this.connectedSockets.push({
      socketId: socket.id,
      userId,
    });

    socket.emit('receive-history', recoveredMessages);
    console.log(this.connectedSockets);
  }

  @SubscribeMessage('send-message')
  async saveNewMessage(socket: Socket, message: Message) {
    this.repository.saveMessageForUser({
      message: message.message,
      userId: message.connectionId,
      publisherId: message.userId,
    });

    const socketTo = this.connectedSockets.find(
      (socket) => socket.userId === message.connectionId,
    );
    socket.to(socketTo?.socketId).emit('receive-message', {
      from: message.userId,
      to: message.connectionId,
      message: message.message,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedSockets = this.connectedSockets.filter(
      (clnt) => clnt.socketId !== client.id,
    );
  }
}
