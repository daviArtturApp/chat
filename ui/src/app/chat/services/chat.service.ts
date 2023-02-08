import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { ChatState } from "../chat.state";
import { EmitMessageDto } from "../interfaces";


@Injectable()
export class ChatService {

   constructor(private socket: Socket, private chatState: ChatState, private route: ActivatedRoute) {
      this.socket.on('connect', () => {
         const userId = window.location.pathname.split('/')[2]
         this.socket.emit('recovery', userId);

         this.socket.on('receive-history', (data: {to: string; from: string; content: string; type: string}[]) => {
            console.log(data)
            this.chatState.updateMessageOfConections(data)
         });

         this.socket.on('receive-message', (data: { from: number, to: number, message: string, type: string }) => {
            this.chatState.updateMessageForUniqueConnection(data)
         })
      });
   }
 
   emitMessage(dto: EmitMessageDto) {
      console.log(dto)
      const adapter = {
         to: +dto.userId,
         from: +dto.connectionId,
         content: dto.message
      }
      this.socket.emit("send-message", adapter)
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