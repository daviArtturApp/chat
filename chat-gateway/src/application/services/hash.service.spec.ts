import * as bcrypt from 'bcrypt';
import { BcryptAdapter } from 'src/infra/adapters/Bcrypt.adapter';
import { HashService } from './hash.service';

describe('test Hash Service', () => {
  let hashService: HashService;
  const myTestPassword = 'testPassword';
  beforeEach(() => {
    hashService = new HashService(new BcryptAdapter(bcrypt));
  });
  it('should return a hashed password', () => {
    const password = hashService.encode(myTestPassword);

    expect(password).toBeTruthy();
    expect(typeof password).toBe('string');
  });

  it('should create a hashed password and compare result to be true', () => {
    const password = hashService.encode(myTestPassword);
    const result = hashService.compare(myTestPassword, password);

    expect(result).toBeTruthy();
  });

  it("should create a hashed password, and compare result to be false because password don't macht", () => {
    const password = hashService.encode(myTestPassword);
    const result = hashService.compare('wrongpassword', password);

    expect(result).toBeFalsy();
  });
});
