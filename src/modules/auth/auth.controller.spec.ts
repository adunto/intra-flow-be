import { Response } from 'express';
import { AuthController } from './auth.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getTokens: jest.fn(),
  logout: jest.fn(),
};

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  // 테스트 전 초기화
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);

    jest.clearAllMocks();
  });

  // Controller 정의가 된 후에 테스트 시작
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('회원가입 테스트', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123!',
        username: 'tester',
      };

      await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledTimes(1);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return access token and set refresh token in cookie', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const tokens = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };

      // 서비스가 성공적으로 토큰을 반환한다고 가정
      service.login.mockResolvedValue(tokens);

      // When
      const result = await controller.login(loginDto, mockResponse);

      // Then
      // 1. 서비스 호출 확인
      expect(service.login).toHaveBeenCalledWith(loginDto);

      // 2. 리턴값(Access Token) 확인
      expect(result).toEqual({ accessToken: tokens.accessToken });

      // 3. 쿠키 설정 확인
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token', // 쿠키 이름
        tokens.refreshToken, // 값
        expect.objectContaining({
          // 옵션 검증
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          // secure 옵션은 환경변수에 따라 다르므로, boolean 타입인지 정도만 체크하거나 생략 가능
          // secure: expect.any(Boolean),
        }),
      );
    });
  });

  // (선택) Refresh 토큰 재발급 테스트
  /*
  describe('refresh', () => {
    it('should set new refresh cookie and return access token', async () => {
      const req = { user: { id: 1, refreshToken: 'old_rt' } };
      const tokens = { accessToken: 'new_at', refreshToken: 'new_rt' };
      
      service.refreshTokens.mockResolvedValue(tokens);

      const result = await controller.refresh(req, mockResponse);

      expect(service.refreshTokens).toHaveBeenCalledWith(1, 'old_rt');
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'new_rt', expect.any(Object));
      expect(result).toEqual({ accessToken: 'new_at' });
    });
  });
  */

  // (선택) 로그아웃 테스트
  /*
  describe('logout', () => {
    it('should call logout service and clear cookie', async () => {
      const req = { user: { id: 1 } };
      
      await controller.logout(req, mockResponse);

      expect(service.logout).toHaveBeenCalledWith(1);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
  */
});
