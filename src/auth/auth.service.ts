import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/request/register.dto.js';
import { User } from '../users/entities/user.entity.js';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './jwt-payload.js';
import { LoginDto } from './dto/request/login.dto.js';
import { TokenResponseDto } from './dto/response/token-response.dto.js';
import { RefreshTokensService } from './refresh-tokens.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokens: RefreshTokensService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    if (await this.usersService.existsByEmail(dto.email)) {
      throw new ConflictException('email already registered');
    }
    const passwordHash = await hash(dto.password);
    return this.usersService.create(dto.email, passwordHash);
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('invalid credentials');
    }
    return {
      accessToken: await this.signAccessToken(user),
      refreshToken: await this.refreshTokens.issue(user.id),
    };
  }

  async refresh(token: string): Promise<TokenResponseDto> {
    const { userId, refreshToken } = await this.refreshTokens.rotate(token);
    const user = await this.usersService.findById(userId);
    return { accessToken: await this.signAccessToken(user), refreshToken };
  }

  logout(token: string): Promise<void> {
    return this.refreshTokens.revoke(token);
  }

  private signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return this.jwtService.signAsync(payload);
  }
}
