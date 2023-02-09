import { JwtService } from '@nestjs/jwt';
import { JwtAdapter } from './Jwt.adapter';

describe('test', () => {
  const jwtAdapter = new JwtAdapter(new JwtService({ secret: 'secret' }));
  it('should return a token', () => {
    const id = 1;
    const token = jwtAdapter.create(id);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });
});
