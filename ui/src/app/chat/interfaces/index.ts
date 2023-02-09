export interface Message {
  type: string;
  content: string;
}

export interface ConnectionHistory {
  connectionId: string;
  messages: Message[]
}

export interface History {
  userId: string;
  connections: ConnectionHistory[]
}

export interface Connection {
  id: string;
  name: string;
  messages: Message[];
};

type FileName = string;

export interface SendFileDto {
  file: [File, FileName];
  publisherId: string;
  userId: string;
}

export interface EmitMessageDto {
  from: number;
  to: number;
  content: string;
}