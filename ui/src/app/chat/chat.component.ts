import { Component } from '@angular/core';
import { FormControl , Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as io from "socket.io-client"

interface Connection {
  id: string;
  name: string;
  messages: string[];
};

interface Message {
  userId: string;
  connectionId: string;
  message: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  socket: io.Socket | null = null
 
  connections: Connection[] = [
    { id: '1', name: 'User 1', messages: [] },
    { id: '2', name: 'User 2', messages: [] },
    { id: '3', name: 'User 3', messages: [] }
  ];



  inputControl = new FormControl('Olá', [Validators.required]);
  currentConnection: Connection = this.connections[0];
  activeChat: HTMLLIElement | null = null
  userId: string | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    const socket = io.connect('http://localhost:3001');
    socket.id = this.userId!
    this.userId = this.route.snapshot.params['userId'];

    this.connections.forEach((cn) => { if (cn.id === this.userId) cn.name = 'Eu'})

    socket.on('connect', () => {
      socket.emit('recovery', this.userId);

      socket.on('receive-history', (data: any) => {
        const connections: any = [[], []]
        for (let a of data) {
          if (!connections[0].includes(a.publisherId)) {
            connections[0].push(a.publisherId)
            connections[1].push({connectionId: a.publisherId, messages: []})
          }
        }

        connections[1].forEach((cn: any) => {
          data.forEach((message: any) => {
            if (cn.connectionId === message.publisherId) {
              cn.messages.push(message.message)
            }
          })
        })

        this.connections.forEach((cn) => {
          connections[1].forEach((cv: any) => {
            if (cn.id === cv.connectionId) {
              cn.messages = cv.messages
            }
          })
        })
      });

      socket.on('receive-message', (data: { from: string, to: string, message: string}) => {
        this.connections.forEach((connection) => {
          if (connection.id === data.from) {
            connection.messages.push(data.message)
          }
        })
      })
    });
  
    this.socket = socket;
  };

  selectNewConnection(connectionId: string, ev: MouseEvent) {
    this.switchClassNameOfActiveChat(ev)
    this.currentConnection = this.connections[+connectionId - 1]
  };

  emitMessage() {
    const message = this.inputControl.value as string
    const currentConnection = this.connections[+this.currentConnection.id - 1];
    currentConnection.messages.push(message);
    this.socket?.emit('send-message', { userId: this.userId, connectionId: this.currentConnection.id, message })
  }

  private switchClassNameOfActiveChat(ev: MouseEvent) {
    this.activeChat?.classList.remove('active-chat')
    const element = ev.target as HTMLLIElement;
    element.classList.add('active-chat')
    this.activeChat = element

  }
} 