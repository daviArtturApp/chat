import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Connection, History } from "./interfaces";

@Injectable()
export class ChatState {
   currentConection = new BehaviorSubject<Connection>({ id: '1', name: 'User 1', messages: [] })
   activeChat$ = new BehaviorSubject<HTMLLIElement | null>(null);
   connections = new BehaviorSubject<Connection[]>(
    [
      { id: '1', name: 'User 1', messages: [] },
      { id: '2', name: 'User 2', messages: [] },
      { id: '3', name: 'User 3', messages: [] }
    ]
   );

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

   getConnections() {
    return this.connections.asObservable()
   }

   updateMessageOfConections(data: History) {
    console.log(data)
    data.connections.forEach((connection) => {
      this.connections.value.forEach((DN) => {
        if (DN.id === connection.connectionId) {
          DN.messages = connection.messages
        }
      })
    })

  }

  updateMessageForUniqueConnection(data: { from: string, to: string, message: string}) {
    this.connections.value.forEach((connection) => {
      if (connection.id === data.from) {
        connection.messages.push({type: 'string', content: data.message})
      }
    })
  }

  setNewMessageForConnection(message: string) {
    const currentConnection = this.currentConection.value;
    currentConnection.messages.push({type: 'string', content: message})
    this.currentConection.next(currentConnection)
  }
 }