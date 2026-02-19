import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePostDto,
  PaginationDto,
  SearchPostDto,
  UpdatePostDto,
} from './posts.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users/users.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // 전체 게시물 조회 (GET)
  @ApiOperation({ summary: '전체 게시물 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @Get()
  async getAllPosts(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    return this.postsService.getAllPosts(page, limit);
  }

  // 게시물 검색 (GET)
  @ApiOperation({ summary: '게시물 검색' })
  @ApiResponse({ status: 200, description: '검색 성공' })
  @Get('search')
  async searchPosts(@Query() searchPostDto: SearchPostDto) {
    // DTO가 자동으로 쿼리 스트링을 파싱합니다.
    return this.postsService.searchPosts(searchPostDto);
  }

  // 단일 게시물 상세 보기 (GET)
  @ApiOperation({ summary: '게시물 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 403, description: '삭제된 게시물입니다.' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  // 게시물 작성 (POST)
  @ApiOperation({ summary: '게시물 작성' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: '작성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @UseGuards(AuthGuard('jwt')) // 로그인 필요
  @Post()
  async createPost(
    @CurrentUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(user.id, createPostDto);
  }

  // 게시물 수정 (PUT)
  @ApiOperation({ summary: '게시물 수정' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 403, description: '본인 게시물이 아님' })
  @ApiResponse({ status: 404, description: '게시물 없음' })
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, user.id, updatePostDto);
  }

  // 게시물 삭제 (DELETE)
  @ApiOperation({ summary: '게시물 삭제' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: '삭제 성공 (No Content)' })
  @ApiResponse({ status: 401, description: '본인 게시물이 아님' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 반환
  async deletePost(@Param('id') id: string, @CurrentUser() user: User) {
    await this.postsService.deletePost(id, user.id);
    // return 값 없음 (204 No Content)
  }
}
