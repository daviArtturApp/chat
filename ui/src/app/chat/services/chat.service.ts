import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { ChatState } from "../chat.state";
import { EmitMessageDto, History, SendFileDto } from "../interfaces";


@Injectable()
export class ChatService {

   constructor(private socket: Socket, private chatState: ChatState, private route: ActivatedRoute) {
      this.socket.on('connect', () => {
         const userId = window.location.pathname.split('/')[2]
         this.socket.emit('recovery', userId);

         this.socket.on('receive-history', (data: History) => {
            this.chatState.updateMessageOfConections(data)
         });

         this.socket.on('receive-message', (data: { from: string, to: string, message: string}) => {
            console.log('recebi')
            this.chatState.updateMessageForUniqueConnection(data)
         })
      });
   }
 
   emitMessage(dto: EmitMessageDto) {
     this.socket.emit("send-message", dto)
   }
   
   emitFile(file: File, publisherId: string, userId: string) {
     const formData = new FormData();
     formData.append('file', file);
     const dto: SendFileDto = {
       file: [file, file.name],
       publisherId,
       userId
     }
     this.socket.emit('send-file', dto)
   }
 }