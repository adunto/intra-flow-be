import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { type Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { type ValidateUser } from './jwt/jwt-refresh.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @Post('signup')
  async register(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공 (Access Token 반환)' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 유저 검증 validateUser
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken };
  }

  @ApiOperation({ summary: 'AccessToken 재발급' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: '재발급 성공' })
  @ApiResponse({
    status: 403,
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: ValidateUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { success, message, accessToken, refreshToken } =
      await this.authService.refreshTokens(user.sub, user.refreshToken);

    if (!success) {
      return { success, message };
    }

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { success, accessToken };
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({
    status: 404,
    description: '이미 로그아웃 되었거나 유효하지 않은 세션입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '로그아웃 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: ValidateUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.deleteToken(user.sub);
      res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });

      return { success: true, message: '성공' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message };
      } else if (error instanceof InternalServerErrorException) {
        return { success: false, message: error.message };
      }

      return { success: false, message: '로그아웃 실패' };
    }
  }
}
