import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users/users.entity';
import { CreateLikeDto } from './likes.dto';

@Controller()
export class LikesController {
  constructor(private likesService: LikesService) {}

  @ApiOperation({ summary: '좋아요 토글 (생성/취소)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '성공 (liked: true/false)' })
  @ApiResponse({ status: 404, description: '대상을 찾을 수 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @CurrentUser() user: User,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    return this.likesService.toggleLike(user.id, createLikeDto);
  }
}
