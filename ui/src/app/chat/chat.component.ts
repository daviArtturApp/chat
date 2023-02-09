import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl , Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserState } from '../app-routing.module';
import { ChatState } from './chat.state';
import { ChatService } from './services/chat.service';
import { DownloadService } from './services/dowload.service';

interface a {
  id: number;
  messages: { type: string, content: string }[];
  name: string;
}

interface User {
  email: string;
  id: number;
  name: string;
  number: string;
  password: string;
  messages: { type: string, content: string }[]
}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  currentConnection: a | null = null;
  fileControl: { preview: string; raw: File } | null = null;
  inputControl = new FormControl('Olá', [Validators.required]);
  userId: string | undefined;
  users: User[] | null = null

  constructor(
    private chatService: ChatService,
    private chatState: ChatState,
    private httpClient: HttpClient,
    private userState: UserState
  ) {

    chatState.getCurrentConnection().subscribe((connection) => {
      this.currentConnection = connection
    });

    chatState.getUsers().subscribe((users) => {
      if (users) {
        this.users = users
      }
    })
  }

  async ngOnInit() {
    this.httpClient.get<User[]>('http://localhost:3000/auth/users').subscribe((users) => {
      const newUsers = users.filter((user) => {
        user.messages = []
        return user.id !== +this.userId!
      })

      this.users = newUsers
      this.chatState.setUsers(newUsers)
    })
    this.userId = this.userState.getUserData()?.id.toString();
  };

  selectNewConnection(connectionId: string, ev: MouseEvent) {
    const user = this.users?.find((user) => 
      user.id === +connectionId
    );
    this.switchClassNameOfActiveChat(ev);
    this.chatState.setNewCurrentConnection({ id: user!.id, messages: user!.messages, name: user!.name }); 
  };

  emitMessage() {
    const message = this.inputControl.value as string;
    this.chatState.setNewMessageForConnection(message);
    this.chatService.emitMessage({
      message,
      connectionId: this.currentConnection!.id.toString(),
      userId: this.userId!,
    })
    this.inputControl.setValue('')
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