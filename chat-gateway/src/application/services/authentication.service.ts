import { UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/domain/contracts/repositories';
import { RoleEnum } from 'src/domain/interface';
import { HashService } from './hash.service';

export class AuthenticationService {
  constructor(
    private repository: UserRepository,
    private hashService: HashService,
    private jwtService: JwtService,
  ) {}

  async authenticate(email: string, simplePassword: string) {
    const user = await this.repository.findOneByEmail(email);
    const hashedPassword = user.password;
    const compareResult = this.comparePassword(simplePassword, hashedPassword);
    return compareResult
      ? this.authorized(user.id, RoleEnum.user)
      : await this.unauthorized();
  }

  private comparePassword(simplePassword: string, hashedPassword: string) {
    const result = this.hashService.compare(simplePassword, hashedPassword);
    console.log(result, 'resultadp');
    return result;
  }

  private authorized(id: string, role: RoleEnum) {
    return this.jwtService.sign({ id, role });
  }

  private async unauthorized() {
    throw new UnprocessableEntityException();
  }
}
