import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoleEnum } from 'src/domain/interface';
import { UserRepositoryInfra } from 'src/infra/repositories/user.repository';
import { HashService } from './hash.service';
import { TokenService } from './Token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private repository: UserRepositoryInfra,
    private hashService: HashService,
    private tokenService: TokenService,
  ) {}

  async authenticate(email: string, simplePassword: string) {
    const user = await this.repository.findOneByEmail(email);

    if (!user) {
      throw new HttpException(
        'Usuário ou senha incorretos',
        HttpStatus.NOT_FOUND,
      );
    }

    const hashedPassword = user.password;
    const compareResult = this.comparePassword(simplePassword, hashedPassword);
    return compareResult
      ? this.authorized(user.id, RoleEnum.user)
      : await this.unauthorized();
  }

  private comparePassword(simplePassword: string, hashedPassword: string) {
    const result = this.hashService.compare(simplePassword, hashedPassword);
    return result;
  }

  private authorized(id: number, role: RoleEnum) {
    return this.tokenService.create(id);
  }

  private async unauthorized() {
    throw new HttpException(
      'Usuário ou senha incorretos',
      HttpStatus.NOT_FOUND,
    );
  }
}
