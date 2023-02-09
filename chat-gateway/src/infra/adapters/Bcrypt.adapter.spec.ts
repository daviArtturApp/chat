import { BcryptAdapter } from './Bcrypt.adapter';
import * as bcrypt from 'bcrypt';

describe('test Bcrypty adapter', () => {
  let bcryptyAdapter: BcryptAdapter;
  const myTestPassword = 'testPassword';
  beforeEach(() => {
    bcryptyAdapter = new BcryptAdapter(bcrypt);
  });
  it('should return a hashed password', () => {
    const password = bcryptyAdapter.encode(myTestPassword);

    expect(password).toBeTruthy();
    expect(typeof password).toBe('string');
  });

  it('should create a hashed password and compare result to be true', () => {
    const password = bcryptyAdapter.encode(myTestPassword);
    const result = bcryptyAdapter.compare(myTestPassword, password);

    expect(result).toBeTruthy();
  });

  it("should create a hashed password, and compare result to be false because password don't macht", () => {
    const password = bcryptyAdapter.encode(myTestPassword);
    const result = bcryptyAdapter.compare('wrongpassword', password);

    expect(result).toBeFalsy();
  });
});
