import { TokenAdapter } from '../contract/JwtAdapter';

export class TokenService {
  constructor(private tokenAdapter: TokenAdapter) {}
  create(id: number) {
    return this.tokenAdapter.create(id);
  }
}
