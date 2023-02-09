import { User } from '../entity/User';

export interface UserRepository {
  findOneByEmail(email: string): Promise<User | null>;
  findOneById(id: number): Promise<User | null>;
  findAll(): Promise<User[] | null>;
}
