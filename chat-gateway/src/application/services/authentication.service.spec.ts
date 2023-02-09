import { CreateUserDto } from 'src/domain/entity/User';
import { BcryptAdapter } from 'src/infra/adapters/Bcrypt.adapter';
import { UserRepositoryMock } from 'test/mocks/repositories';
import { AuthenticationService } from './authentication.service';
import { HashService } from './hash.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInfra } from 'src/infra/repositories/user.repository';
import { TokenService } from './Token.service';
import { JwtAdapter } from 'src/infra/adapters/Jwt.adapter';
import { HttpException } from '@nestjs/common';

const createUserDto: CreateUserDto = {
  email: 'example@gmail.com',
  id: 1,
  name: 'john',
  number: '3799999999',
  password: '$2a$10$CcR2eX/yN2mUGa0B711xvOPRTvE4CdubqxpNOiVBUN1FCFtRDYKIi', // to equal "password"
};

describe('test authentication service', () => {
  let userRepositoryMock: UserRepositoryMock;
  let hashService: HashService;
  let tokenService: TokenService;

  beforeEach(() => {
    userRepositoryMock = new UserRepositoryMock(createUserDto);
    hashService = new HashService(new BcryptAdapter(bcrypt));
    tokenService = new TokenService(
      new JwtAdapter(new JwtService({ secret: 'secret' })),
    );
  });

  it('should authenticate an user', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock as unknown as UserRepositoryInfra,
      hashService,
      tokenService,
    );
    const token = await authService.authenticate(
      'example@gmail.com',
      'password',
    );

    expect(userRepositoryMock.callsCount === 1);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should return a error 404 for wrong email', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock as unknown as UserRepositoryInfra,
      hashService,
      tokenService,
    );

    let error: Error;
    try {
      await authService.authenticate('wrong@gmail.com', 'password');
    } catch (err) {
      error = err;
    }

    expect(userRepositoryMock.callsCount === 1);
    expect(error).toBeInstanceOf(HttpException);
  });

  it('should return a error 404 for wrong password', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock as unknown as UserRepositoryInfra,
      hashService,
      tokenService,
    );

    let error: Error;
    try {
      await authService.authenticate('example@gmail.com', 'wrong password');
    } catch (err) {
      error = err;
    }

    expect(userRepositoryMock.callsCount === 1);
    expect(error).toBeInstanceOf(HttpException);
  });
});
