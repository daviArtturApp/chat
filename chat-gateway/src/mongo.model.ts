import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

const Messages = new Schema({
  type: String,
  content: String,
});

const Connections = new Schema({
  connectionId: String,
  messages: [Messages],
});

const User = new Schema({
  userId: String,
  connections: [Connections],
});

export const ChatSchema = new Schema({
  socketId: String,
  chats: [User],
});
