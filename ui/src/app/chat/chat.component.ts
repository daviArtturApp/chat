import { Component } from '@angular/core';
import { FormControl , Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import * as io from "socket.io-client"

interface Message {
  type: string;
  content: string;
}

interface ConnectionHistory {
  connectionId: string;
  messages: Message[]
}

interface History {
  userId: string;
  connections: ConnectionHistory[]
}

interface Connection {
  id: string;
  name: string;
  messages: Message[];
};

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

  fileControl: { preview: string; raw: File } | null = null;
  inputControl = new FormControl('Olá', [Validators.required]);
  currentConnection: Connection = this.connections[0];
  activeChat: HTMLLIElement | null = null;
  userId: string | undefined;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const socket = io.connect('http://localhost:3001');
    socket.id = this.userId!
    this.userId = this.route.snapshot.params['userId'];

    this.connections.forEach((cn) => { if (cn.id === this.userId) cn.name = 'Eu'})

    socket.on('connect', () => {
      socket.emit('recovery', this.userId);

      socket.on('receive-history', (data: History) => {

        data.connections.forEach((connection) => {
          console.log(connection)

          this.connections.forEach((DN) => {
            if (DN.id === connection.connectionId) {
              DN.messages = connection.messages
            }
          })

          this.connections[0].messages.push({
            content: 'http://localhost:3000/other.svg',
            type: 'file'
          })
        })
      });

      socket.on('receive-message', (data: { from: string, to: string, message: string}) => {
        this.connections.forEach((connection) => {
          if (connection.id === data.from) {
            connection.messages.push({type: 'string', content: data.message})
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
    currentConnection.messages.push({type: 'string', content: message});
    this.socket?.emit('send-message', { userId: this.userId, connectionId: this.currentConnection.id, message })
  }

  emitFile() {
    const formData = new FormData()
    formData.append('file', this.fileControl!.raw)
    console.log(this.fileControl?.raw, this.fileControl?.preview)
    this.socket?.emit('send-file', [this.fileControl!.raw, 'other.svg'])
  }

  handleFile(ev: Event) {
    const target = ev.target as HTMLInputElement
    this.fileControl = {
      preview: URL.createObjectURL(target.files![0]),
      raw: target.files![0],
    }
  }

  private switchClassNameOfActiveChat(ev: MouseEvent) {
    this.activeChat?.classList.remove('active-chat')
    const element = ev.target as HTMLLIElement;
    element.classList.add('active-chat')
    this.activeChat = element
  }
} 