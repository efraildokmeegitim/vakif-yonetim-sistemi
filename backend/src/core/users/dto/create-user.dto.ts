export class CreateUserDto {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  role?: string;
}
