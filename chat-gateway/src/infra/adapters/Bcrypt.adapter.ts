import { HashAdapter } from 'src/application/contract/HashAdapter';
import * as Bcrypt from 'bcrypt';

export class BcryptAdapter implements HashAdapter {
  constructor(private bcrypt: typeof Bcrypt) {}

  encode(password: string): string {
    const salt = 'receive from .env';
    const hashedPassword = this.bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  compare(simplePassword: string, hashedPassword: string): boolean {
    const compareResult = this.bcrypt.compareSync(
      simplePassword,
      hashedPassword,
    );
    return compareResult;
  }
}