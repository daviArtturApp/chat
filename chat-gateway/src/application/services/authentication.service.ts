import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from 'src/domain/interface';
import { UserRepositoryInfra } from 'src/infra/repositories/user.repository';
import { HashService } from './hash.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private repository: UserRepositoryInfra,
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

  private authorized(id: number, role: RoleEnum) {
    return this.jwtService.sign({ id, role });
  }

  private async unauthorized() {
    throw new UnprocessableEntityException();
  }
}
