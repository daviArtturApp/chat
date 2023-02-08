import { User } from '../entity/User';

export interface UserRepository {
  findOneByEmail(email: string): Promise<User | null>;
}
