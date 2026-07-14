import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    console.log("LOGIN CALLED WITH USER:", JSON.stringify(user, null, 2));
    const roleName = user.roleObject?.name || 'user';
    const permissions = user.roleObject?.permissions?.map((p: any) => p.action) || [];
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: roleName,
      permissions: permissions
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: any) {
    return this.usersService.create(userData);
  }
}
