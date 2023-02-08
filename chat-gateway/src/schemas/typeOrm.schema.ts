import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  to: string;

  @Column('text')
  type: string;

  @Column('text')
  from: string;

  @Column('text')
  content: string;
}

interface SaveMessageDto {
  to: string;
  from: string;
  content: string;
}
@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat)
    private photoRepository: Repository<Chat>,
  ) {}
  async saveMessageForUser(dto: SaveMessageDto) {
    await this.photoRepository.insert({ ...dto, type: 'string' });
  }
  async recoveryMessages(userId: string) {
    const result = await this.photoRepository.query(
      `SELECT * FROM chat WHERE "to" = ${userId} OR "from" = ${userId};`,
    );
    return result;
  }
  async saveFile(dto: SaveMessageDto) {
    await this.photoRepository.insert({ ...dto, type: 'file' });
  }
}
