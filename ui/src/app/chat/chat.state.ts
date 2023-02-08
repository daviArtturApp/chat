import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Connections {
  id: number;
  messages: {
    type: string;
    content: string
  }[]
  name: string
}
export interface ChatStructure {
  index: number[];
  messages: Connections[];
}

interface User {
  email: string;
  id: number;
  name: string;
  number: string;
  password: string;
  messages: { type: string, content: string }[]
}

@Injectable()
export class ChatState {
   currentConection = new BehaviorSubject<Connections>({ id: 3, messages: [], name: 'Eu'})
   activeChat$ = new BehaviorSubject<HTMLLIElement | null>(null);
   connections = new BehaviorSubject<ChatStructure | null>(null);
   users = new BehaviorSubject<User[] | null>(null)
   setNewCurrentConnection(currentConnection: Connections) {
    console.log(currentConnection)
     this.currentConection.next(currentConnection)
   }
 
   setNewActiveChat(element$: HTMLLIElement) {
     this.activeChat$.value?.classList.remove('active-chat')
     element$.classList.add('active-chat')
     this.activeChat$.next(element$)
   }

   setUsers(users: User[]) {
    this.users.next(users)
   }

   getUsers() {
    return this.users.asObservable()
   }
 
   getActiveChat() {
     return this.activeChat$.asObservable()
   }
 
   getCurrentConnection() {
     return this.currentConection.asObservable()
   }

   getConnections() {
    return this.connections.asObservable()
   }

   updateMessageOfConections(data: {to: string; from: string; content: string; type: string;}[]) {
      const result = this.users.value?.map((user) => {
        let index = 0;
        while (index < data.length) {
          const currentDataMessage = data[index];
          if (+currentDataMessage.from === user.id || +currentDataMessage.to === user.id) {
            user.messages.push({
              content: currentDataMessage.content,
              type: currentDataMessage.type
            })
          }
          index++
        }
        return user
      })
    this.users.next(result!);
  }

  updateMessageForUniqueConnection(data: { from: number, to: number, message: string, type: string }) {
    const updatedResult = this.users.value?.map((user) => {
      if (user.id === data.from) {
        user.messages.push({content: data.message, type: data.type})
      }
      return user
    })
    this.users.next(updatedResult!)
  }

  setNewMessageForConnection(message: string) {
    const currentConnection = this.currentConection.value;
    currentConnection.messages.push({type: 'string', content: message})
    this.currentConection.next(currentConnection)
  }
 }