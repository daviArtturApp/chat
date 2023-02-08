import { HashAdapter } from 'src/application/contract/HashAdapter';
import * as Bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptAdapter implements HashAdapter {
  constructor(private bcrypt: typeof Bcrypt) {}

  encode(password: string): string {
    const salt = 10;
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
