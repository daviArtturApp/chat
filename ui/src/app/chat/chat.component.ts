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

    socket.on('connect', () => {
      socket.emit('recovery', this.userId);

      socket.on('receive-history', (data: any) => {
        var start = window.performance.now();
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
        var end = window.performance.now();
        console.log(`Execution time: ${end - start} ms`);
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

    this.userId = this.route.snapshot.params['userId'];

  };

  selectNewConnection(connectionId: string) {
    this.currentConnection = this.connections[+connectionId - 1]
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
