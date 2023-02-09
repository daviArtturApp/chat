import { UserRepository } from 'src/domain/contracts/repositories';
import { CreateUserDto, User } from 'src/domain/entity/User';

export class UserRepositoryMock implements UserRepository {
  callsCount = 0;
  constructor(
    private createUserDto: CreateUserDto,
    private throwError?: unknown,
  ) {
    if (this.throwError) {
      throw this.throwError;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    this.callsCount++;
    if (email === this.createUserDto.email) {
      return new User(this.createUserDto);
    }
    return null;
  }

  async findOneById(id: number): Promise<User | null> {
    this.callsCount++;
    if (id === this.createUserDto.id) {
      return new User(this.createUserDto);
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    this.callsCount++;
    return [new User(this.createUserDto)];
  }
}
