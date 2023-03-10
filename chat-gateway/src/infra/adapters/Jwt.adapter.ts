import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenAdapter } from 'src/application/contract/JwtAdapter';

@Injectable()
export class JwtAdapter implements TokenAdapter {
  constructor(private jwtService: JwtService) {}

  create(id: number): string {
    return this.jwtService.sign({ id });
  }
}
