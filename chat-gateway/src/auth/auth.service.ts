import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async compareCredentials() {
    return { userId: 'sd8f0vv038ng30', role: 'USER' };
  }
}
