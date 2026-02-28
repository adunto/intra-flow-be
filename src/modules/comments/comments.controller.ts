import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users/users.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 작성
  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: '성공' })
  @UseGuards(AuthGuard('jwt'))
  @Post('posts/:postId/comments') // URL: /posts/1/comments
  async createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      user.id,
      postId,
      createCommentDto,
    );
  }

  // 댓글 목록 조회
  @ApiOperation({ summary: '게시물의 댓글 목록 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.commentsService.getCommentsByPostId(postId);
  }

  // 댓글 수정
  @ApiOperation({ summary: '댓글 수정' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('comments/:id') // URL: /comments/1 (게시물 ID 불필요)
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(user.id, id, updateCommentDto);
  }

  // 댓글 삭제
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.deleteComment(user.id, id);
  }
}
