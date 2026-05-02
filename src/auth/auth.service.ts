import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import type { AccessTokenPayload } from './strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      isActive: true,
    });
    return this.signAccessToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );
    return this.signAccessToken(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findActiveOne(userId);
    return {
      id: user.id,
      code: user.code,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
    };
  }

  async logout(userId: string) {
    await this.usersService.invalidateTokens(userId);
  }

  private signAccessToken(user: UserEntity) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tv: user.tokenVersion,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer' as const,
    };
  }
}
