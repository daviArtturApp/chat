import { UserRepository } from 'src/domain/contracts/repositories';
import { CreateUserDto, User } from 'src/domain/entity/User';

export class UserRepositoryMock implements UserRepository {
  constructor(
    private createUserDto: CreateUserDto,
    private throwError?: unknown,
  ) {
    if (this.throwError) {
      throw this.throwError;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    if (email === this.createUserDto.email) {
      return new User(this.createUserDto);
    }
    return null;
  }

  async findOneById(id: number): Promise<User | null> {
    if (id === this.createUserDto.id) {
      return new User(this.createUserDto);
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return [new User(this.createUserDto)];
  }
}
