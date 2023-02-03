import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  userId: string | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    const socket = io.connect('http://localhost:3001');
    socket.id = this.userId!
    this.socket = socket;

    this.userId = this.route.snapshot.params['userId'];

  };

  selectNewConnection(connectionId: string) {
    this.socket?.emit('recovery', connectionId)
  };

  emitMessage() {
    const message = this.inputControl.value as string
    const currentConnection = this.connections[+this.currentConnection.id - 1];
    currentConnection.messages.push(message);

    this.socket?.emit('send-message', { userId: this.userId, connectionId: this.currentConnection.id, message })
  }

}
// export class ChatComponent {

//    socket: io.Socket | null = null
  
//    connections: Connection[] = [
//     { id: '1', name: 'User 1', messages: [] },
//     { id: '2', name: 'User 2', messages: [] },
//     { id: '3', name: 'User 3', messages: [] }
//   ];

//   inputControl = new FormControl('Olá', [Validators.required]);
//   currentConnection: Connection = this.connections[0];
//   userId: string | undefined;

//   constructor(private route: ActivatedRoute) { }

//   ngOnInit() {
//     const socket = io.connect('http://localhost:3001');
//     socket.id = this.userId!
//     socket.on("connect", () => {
      
//       socket.emit('register', this.userId)
//       socket.on('receive-message', (message: Message) => {
//         console.log(message)
//         this.connections.forEach((cn) => {
//           if (cn.id === message.userId) {
//             cn.messages.push(message.message)
//           }
//         })
//       })
//     });

//     this.socket = socket;

//     this.userId = this.route.snapshot.params['userId'];

//   };

//   selectNewConnection(connectionId: string) {
//     this.currentConnection = this.connections.find((connection) => connection.id === connectionId)!;
//   };

//   emitMessage() {
//     const message = this.inputControl.value as string
//     const currentConnection = this.connections[+this.currentConnection.id - 1];
//     currentConnection.messages.push(message);
    
//     this.socket?.emit(
//       'send-message',
//       { userId: this.userId, connectionId: this.currentConnection.id, message }
//     );
//   }
 
// }
