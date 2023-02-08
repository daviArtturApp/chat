import { UserRepository } from 'src/domain/contracts/repositories';
import { HashService } from './hash.service';

export class AuthenticationService {
  constructor(
    private repository: UserRepository,
    private hashService: HashService,
  ) {}

  async authenticate(userId: string, simplePassword: string) {
    const user = await this.repository.findOneById(userId);
    const hashedPassword = user.password;
    const compareResult = this.comparePassword(simplePassword, hashedPassword);
    return compareResult;
  }

  private comparePassword(simplePassword: string, hashedPassword: string) {
    const result = this.hashService.compare(simplePassword, hashedPassword);
    return result ? this.authorized() : this.unauthorized();
  }

  private authorized() {
    return true;
  }

  private unauthorized() {
    return false;
  }
}
