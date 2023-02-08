import {} from 'class-validator';
import { IsEmail } from 'class-validator';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator/types/decorator/decorators';

export class AuthUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
