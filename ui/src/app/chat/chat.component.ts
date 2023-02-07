import { Component } from '@angular/core';
import { FormControl , Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as io from "socket.io-client"
import { ChatState, ChatStructure } from './chat.state';
import { Connection } from './interfaces';
import { ChatService } from './services/chat.service';
import { DownloadService } from './services/dowload.service';
interface a {
  id: number;
  messages: { type: string, content: string }[];
}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  socket: io.Socket | null = null
  connections: ChatStructure | null = null;
  currentConnection: a | null = null;

  fileControl: { preview: string; raw: File } | null = null;
  inputControl = new FormControl('Olá', [Validators.required]);
  activeChat: HTMLLIElement | null = null;
  userId: string | undefined;

  constructor(private route: ActivatedRoute, private chatService: ChatService, private chatState: ChatState) {

    chatState.getCurrentConnection().subscribe((connection) => {
      console.log(connection)
      this.currentConnection = connection
    });

    chatState.getActiveChat().subscribe((chatElement) => {
      this.activeChat = chatElement
    })

    chatState.getConnections().subscribe((connections) => {
      if (connections) {
        this.connections = connections
      }
    })
  }

  ngOnInit() {
    this.userId = this.route.snapshot.params['userId'];
    //this.connections.forEach((cn) => { if (cn.id === this.userId) cn.name = 'Eu'})
  };

  selectNewConnection(connectionId: string, ev: MouseEvent) {
    const connection = this.connections?.messages.find((message) => 
      message.id === +connectionId
    );
    this.switchClassNameOfActiveChat(ev);
    this.chatState.setNewCurrentConnection(connection!); 
  };

  emitMessage() {
    const message = this.inputControl.value as string
    this.chatState.setNewMessageForConnection(message);
    this.chatService.emitMessage({
      message,
      connectionId: this.currentConnection!.id.toString(),
      userId: this.userId!,
    })
  }

  emitFile() {
    this.chatService?.emitFile(this.fileControl!.raw, this.userId!, this.currentConnection!.id);
    
    setTimeout(() => {
      this.currentConnection?.messages.push({ type: 'file', content: this.fileControl?.raw.name! });
    }, 2000)
  }

  downloadFile(event: MouseEvent) {
    const element$ = event.target as HTMLImageElement
    new DownloadService(element$.src).dowload()
  }

  handleFile(ev: Event) {
    const target = ev.target as HTMLInputElement
    this.fileControl = {
      preview: URL.createObjectURL(target.files![0]),
      raw: target.files![0],
    }
  }

  private switchClassNameOfActiveChat(ev: MouseEvent) {
    const element = ev.target as HTMLLIElement;
    this.chatState.setNewActiveChat(element)
  }
}