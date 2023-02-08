import { User } from '../entity/User';

export interface UserRepository {
  findOneById(userId: string): Promise<User | null>;
}
