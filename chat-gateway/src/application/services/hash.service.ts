import { HashAdapter } from '../contract/HashAdapter';

export class HashService {
  constructor(private hashAdapter: HashAdapter) {}

  encode(password: string) {
    return this.hashAdapter.encode(password);
  }

  compare(passwordOne: string, passwordTwo: string) {
    return this.hashAdapter.compare(passwordOne, passwordTwo);
  }
}
