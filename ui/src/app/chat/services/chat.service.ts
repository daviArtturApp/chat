import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { ChatState } from "../chat.state";
import { EmitMessageDto } from "../interfaces";

interface Message {
   from: number,
   to: number,
   message: string,
   type: string
}

@Injectable()
export class ChatService {

   constructor(private socket: Socket, private chatState: ChatState, private router: Router) {
      this.verifyToken()
      this.socket.on('connect', () => {
         this.socket.emit('recovery', window.localStorage.getItem('token'));

         this.socket.on('receive-history', (data: { to: string; from: string; content: string; type: string}[]) => {
            this.chatState.updateMessageOfConections(data)
         });

         this.socket.on('receive-message', (data: Message) => {
            this.chatState.updateMessageForUniqueConnection(data)
         })
      });
   }

   private verifyToken() {
      if (!window.localStorage.getItem("token")) {
         this.router.navigateByUrl('login')
      }
   }
 
   emitMessage(dto: EmitMessageDto) {
      this.socket.emit("send-message", dto)
   }
   
   emitFile(file: File, publisherId: string, userId: number) {
     const formData = new FormData();
     formData.append('file', file);
     const dto = {
       file: [file, file.name],
       to: +publisherId,
       from: userId
     }
     this.socket.emit('send-file', dto)
   }
 }