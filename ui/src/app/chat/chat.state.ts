import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Connections {
  id: number;
  messages: {
    type: string;
    content: string
  }[]
}
export interface ChatStructure {
  index: number[];
  messages: Connections[]
}

@Injectable()
export class ChatState {
   currentConection = new BehaviorSubject<Connections>({ id: 3, messages: []})
   activeChat$ = new BehaviorSubject<HTMLLIElement | null>(null);
   connections = new BehaviorSubject<ChatStructure | null>(null);

   setNewCurrentConnection(currentConnection: Connections) {
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

   updateMessageOfConections(data: {to: string; from: string; content: string; type: string;}[]) {
    let structure: ChatStructure = {
      index: [],
      messages: []
    }
    let counter = 0;
    while (counter < data.length) {
      const currentData = data[counter];
      const PK = +currentData.to + +currentData.from;
      counter++
      if (!structure.index.includes(PK)) {
        structure.index.push(PK)
        structure.messages.push(
          {
            id: PK, // alterar para PK - userId
            messages: [{ type: currentData.type, content: currentData.content }]
          }
        )
      } else {
        structure.messages.forEach((messages) => {
          if (messages.id === PK) {
            messages.messages.push({ type: currentData.type, content: currentData.content })
          }
        })
      }
    }
    this.connections.next(structure);
  }

  updateMessageForUniqueConnection(data: { from: string, to: string, message: string, type: string }) {
    const pk = +data.from + +data.to
    this.connections.value?.messages.forEach((connection) => {
      if (connection.id === pk) {
        connection.messages.push({type: data.type, content: data.message})
      }
    })
  }

  setNewMessageForConnection(message: string) {
    const currentConnection = this.currentConection.value;
    currentConnection.messages.push({type: 'string', content: message})
    this.currentConection.next(currentConnection)
  }
 }