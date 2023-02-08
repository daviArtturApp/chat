import { Injectable } from '@nestjs/common';
import { RoleEnum } from 'src/domain/interface';

@Injectable()
export class AuthorizationService {
  constructor(private userRole: RoleEnum, private necessaryRole: RoleEnum) {}

  authorizate() {
    return this.userRole === this.necessaryRole ? true : false;
  }
}
