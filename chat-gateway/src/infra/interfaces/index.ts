import { Request as ReqExpress } from 'express';
import { RoleEnum } from 'src/domain/interface';

export interface Request extends ReqExpress {
  user: {
    userId: string;
    role: RoleEnum;
  };
}
