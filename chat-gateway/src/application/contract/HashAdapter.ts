export interface HashAdapter {
  encode(password: string): string;
  compare(passwordOne: string, passwordTwo: string): boolean;
}
