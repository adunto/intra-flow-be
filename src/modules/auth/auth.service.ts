import { type Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.dto';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 회원가입
  async register(registerDto: RegisterDto): Promise<void> {
    const { email, password, username } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 유저 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  // 로그인 (유저 검증 + 토큰 발급)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('이메일 또는 비밀번호를 확인해주세요');
    }

    return this.getTokens(user.id, user.email);
  }

  // 토큰 생성 (Access + Refresh)
  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      // AccessToken : 짧은 만료 시간 (15m)
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      // RefreshToken : 긴 만료 시간 (7d)
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    // Redis에 Refresh Token 저장 (해싱)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.cacheManager.set(
      `refresh_token:${userId}`,
      hashedRefreshToken,
      7 * 24 * 60 * 60 * 1000, // 7일 TTL
    );

    return { accessToken, refreshToken };
  }
}
