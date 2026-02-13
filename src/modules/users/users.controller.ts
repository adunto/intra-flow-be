import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from './users.entity';
import { Post } from '../posts/posts.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  // 유저 정보 조회 (GET)
  @ApiOperation({ summary: '내 정보 조회 (프로필)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: User })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  // 유저가 작성한 게시물 목록 조회 (GET)
  @ApiOperation({ summary: '내가 작성한 게시물 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [Post] })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('posts')
  async getUserPosts(@CurrentUser() user: User) {
    return this.userService.getUserPosts(user.id);
  }
}
