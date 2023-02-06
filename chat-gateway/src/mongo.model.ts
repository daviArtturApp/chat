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

export const ChatSchema = new Schema({
  userId: String,
  connections: [Connections],
});
