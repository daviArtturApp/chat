import { Component } from '@angular/core';
import { FormControl , Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  chatService: ChatService | undefined;
  chatState: ChatState;
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

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    const chatState = new ChatState()
    this.chatState = chatState;

    chatState.getCurrentConnection().subscribe((connection) => {
      console.log(connection)
      this.currentConnection = connection
    });

    chatState.getActiveChat().subscribe((chatElement) => {
      this.activeChat = chatElement
    })
  }

  ngOnInit() {
    const socket = io.connect('http://localhost:3001');
    this.chatService = new ChatService(socket)
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
    const newCurrentConnection = this.connections[+connectionId - 1]
    this.chatState.setNewCurrentConnection(newCurrentConnection); 
  };

  emitMessage() {
    const message = this.inputControl.value as string
    this.currentConnection.messages.push({type: 'string', content: message});

    this.chatService?.emitMessage({
      message,
      connectionId: this.currentConnection.id,
      userId: this.userId!
    })
  }

  emitFile() {
    this.currentConnection.messages.push({ type: 'file', content: this.fileControl?.preview! });
    this.chatService?.emitFile(this.fileControl!.raw, this.userId!, this.currentConnection.id)
  }

  async downloadFile(event: MouseEvent) {
    const element$ = event.target as HTMLImageElement
    await new DownloadService(element$.src).dowload()
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

type FileName = string;

interface SendFileDto {
  file: [File, FileName];
  publisherId: string;
  userId: string;
}

interface EmitMessageDto {
  connectionId: string;
  userId: string;
  message: string;
}

class ChatService {

  constructor(private socket: io.Socket) {

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

class ChatState {
  currentConection = new BehaviorSubject<Connection>({ id: '1', name: 'User 1', messages: [] })
  activeChat$ = new BehaviorSubject<HTMLLIElement | null>(null);

  setNewCurrentConnection(currentConnection: Connection) {
    this.currentConection.next(currentConnection)
  }

  setNewActiveChat(element$: HTMLLIElement) {
    this.activeChat$.value?.classList.remove('active-chat')
    element$.classList.add('active-chat')
    this.activeChat$.next(element$)
  }

  getActiveChat() {
    return this.activeChat$.asObservable()
  }

  getCurrentConnection() {
    return this.currentConection.asObservable()
  }
}

class DownloadService {

  constructor(private url: string) {}

  async dowload() {
    const objUrl = await this.createObjUrl();
    const link$ = await this.createLinkElement(objUrl);
    this.clickInElementForDownload(link$);
  }

  private async createObjUrl() {
    const objUrl = window.URL.createObjectURL(await (await fetch(this.url)).blob())
    return objUrl;
  }

  private async createLinkElement(objUrl: string) {
    const link$ = document.createElement('a');
    link$.href = objUrl;
    link$.download = '';
    return link$;
  }

  private clickInElementForDownload(link$: HTMLAnchorElement) {
    document.body.appendChild(link$);
    link$.click();
    document.body.removeChild(link$);
  }
}