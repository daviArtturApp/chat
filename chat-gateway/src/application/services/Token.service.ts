import { Injectable } from '@nestjs/common';
import { TokenAdapter } from '../contract/JwtAdapter';

@Injectable()
export class TokenService {
  constructor(private tokenAdapter: TokenAdapter) {}
  create(id: number) {
    return this.tokenAdapter.create(id);
  }
}
