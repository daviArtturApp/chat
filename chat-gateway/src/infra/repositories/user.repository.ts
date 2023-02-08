import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/domain/contracts/repositories';
import { User } from 'src/domain/entity/User';
import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text')
  number: string;

  @Column('text')
  password: string;

  @Column('text')
  companyId?: string;
}

@Injectable()
export class UserRepositoryInfra {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOneByEmail(email: string) {
    // await this.userRepository.insert({
    //   email: 'teste3@gmail.com',
    //   name: 'Davi',
    //   number: '3799459999',
    //   password: '$2b$10$jz7X3M7oP2tnAgN71/uyvOPGOWqWslNmcnsfuqrOKOhDsurqKP3WO',
    //   companyId: '123123123',
    // });
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return new User(user);
  }

  async findAll() {
    const users = await this.userRepository.find();

    return users.map((user) => {
      return new User({
        email: user.email,
        id: user.id,
        name: user.name,
        number: user.number,
        password: user.password,
      });
    });
  }
}
