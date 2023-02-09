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

const userRepositoryMock = new UserRepositoryMock(
  createUserDto,
) as unknown as UserRepositoryInfra;
const hashService = new HashService(new BcryptAdapter(bcrypt));
const tokenService = new TokenService(
  new JwtAdapter(new JwtService({ secret: 'secret' })),
);
describe('test authentication service', () => {
  it('should authenticate an user', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock,
      hashService,
      tokenService,
    );
    const token = await authService.authenticate(
      'example@gmail.com',
      'password',
    );

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should return a error 404 for wrong email', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock,
      hashService,
      tokenService,
    );

    let error: Error;
    try {
      await authService.authenticate('wrong@gmail.com', 'password');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(HttpException);
    console.log(error.message);
  });

  it('should return a error 404 for wrong password', async () => {
    const authService = new AuthenticationService(
      userRepositoryMock,
      hashService,
      tokenService,
    );

    let error: Error;
    try {
      await authService.authenticate('example@gmail.com', 'wrong password');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(HttpException);
    console.log(error.message);
  });
});
