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

export class UserRepositoryInfra implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return new User({
      email,
      id: user.id,
      name: user.name,
      number: user.number,
      password: user.password,
    });
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
