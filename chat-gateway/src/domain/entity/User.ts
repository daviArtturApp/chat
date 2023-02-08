export class User {
  name: string;
  email: string;
  number: string;
  password: string;
  companyId?: string;
  id: string;

  constructor(dto: CreateUserDto) {
    this.name = dto.name;
    this.email = dto.email;
    this.number = dto.number;
    this.password = dto.password;
    this.companyId = dto.companyId;
    this.id = dto.id;
  }
}

export interface CreateUserDto {
  name: string;
  email: string;
  number: string;
  password: string;
  id: string;
  companyId?: string;
}
