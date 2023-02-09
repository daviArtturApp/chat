import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { UserState } from "src/app/app-routing.module";
import { ChatState } from "../chat.state";
import { EmitMessageDto } from "../interfaces";


@Injectable()
export class ChatService {

   constructor(private userState: UserState, private socket: Socket, private chatState: ChatState, private route: ActivatedRoute, private router: Router) {
      this.verifyToken()
      this.socket.on('connect', () => {
         const userId = this.userState.getUserData()?.id.toString();
         this.socket.emit('recovery', window.localStorage.getItem('token'));

         this.socket.on('receive-history', (data: { to: string; from: string; content: string; type: string}[]) => {
            this.chatState.updateMessageOfConections(data)
         });

         this.socket.on('receive-message', (data: { from: number, to: number, message: string, type: string }) => {
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