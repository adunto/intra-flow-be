import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  type Repository,
  type WhereExpressionBuilder,
} from 'typeorm';
import {
  type CreatePostDto,
  type SearchPostDto,
  SearchType,
  type UpdatePostDto,
} from './posts.dto';
import { Post } from './posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  // 전체 게시물 조회 (최신순, 페이지네이션)
  async getAllPosts(page: number, limit: number) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const [posts, total] = await this.postsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        viewCount: true,
        // likeCount: true,
        createdAt: true,
        updatedAt: true,
        user: { id: true, username: true, email: true },
      },
      take: limitNum, // 가져올 개수 (LIMIT)
      skip: (pageNum - 1) * limitNum, // 건너뛸 개수 (OFFSET)
    });

    return {
      data: posts,
      meta: {
        total,
        page: pageNum,
        lastPage: Math.ceil(total / limitNum),
      },
    };
  }

  // 게시물 검색 (페이지네이션)
  async searchPosts(searchPostDto: SearchPostDto) {
    const {
      searchType,
      searchItem,
      page = 1, // DTO 기본값이 있어도 안전하게 처리
      limit = 10,
    } = searchPostDto;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const keyword = `%${searchItem}%`;
    const qb = this.postsRepository.createQueryBuilder('post');

    qb.leftJoinAndSelect('post.user', 'user');

    qb.select([
      'post.id',
      'post.title',
      'post.viewCount',
      // 'post.likeCount',
      'post.createdAt',
      'post.updatedAt',
      'user.id',
      'user.username',
      'user.email',
    ]);

    // 검색 조건이 있을 때만 필터링
    if (searchType && searchType.length > 0 && searchItem) {
      qb.andWhere(
        new Brackets((innerQb: WhereExpressionBuilder) => {
          if (searchType.includes(SearchType.TITLE)) {
            innerQb.orWhere('post.title LIKE :keyword', { keyword });
          }
          if (searchType.includes(SearchType.CONTENT)) {
            innerQb.orWhere(
              `EXISTS (
                SELECT 1 
                FROM jsonb_path_query(
                  post.content, 
                  '$.** ? (@.type == "text").text'
                ) AS extracted_text 
                WHERE extracted_text::text LIKE :keyword
              )`,
              { keyword },
            );
          }
          if (searchType.includes(SearchType.AUTHOR)) {
            innerQb.orWhere('user.username LIKE :keyword', { keyword });
          }
        }),
      );
    }

    qb.orderBy('post.createdAt', 'DESC');

    // 페이지네이션 적용 (skip, take)
    qb.skip((pageNum - 1) * limitNum);
    qb.take(limitNum);

    // getManyAndCount()를 사용하여 결과와 전체 개수를 한 번에 가져옴
    const [posts, total] = await qb.getManyAndCount();

    return {
      data: posts,
      meta: {
        total,
        page: pageNum,
        lastPage: Math.ceil(total / limitNum),
      },
    };
  }

  // 단일 게시물 조회 (상세보기)
  async getPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`게시물(ID: ${id})을 찾을 수 없습니다.`);
    }

    if (post.deletedAt) {
      throw new ForbiddenException(`해당 게시물은 삭제되었습니다. (ID: ${id})`);
    }

    await this.postsRepository.increment({ id }, 'viewCount', 1);

    return post;
  }

  // 게시물 작성
  async createPost(
    userId: number,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const { title, content } = createPostDto;

    const newPost = this.postsRepository.create({
      title,
      content,
      userId, // FK 설정
    });

    return this.postsRepository.save(newPost);
  }

  // 게시물 수정
  async updatePost(
    id: string,
    userId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.checkPostOwnership(id, userId);

    // 내용 업데이트
    post.title = updatePostDto.title;
    post.content = updatePostDto.content;

    // 수정일 업데이트
    post.updatedAt = new Date();

    return this.postsRepository.save(post);
  }

  // 게시물 삭제
  async deletePost(id: string, userId: number): Promise<void> {
    // 게시물 존재 및 권한 확인
    await this.checkPostOwnership(id, userId);

    // 삭제 실행
    await this.postsRepository.delete(id);
  }

  // --- Helper Methods ---

  // 게시물 존재 여부 및 작성자 본인 확인용 헬퍼 함수
  private async checkPostOwnership(
    postId: string,
    userId: number,
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 게시물만 수정/삭제할 수 있습니다.');
    }

    return post;
  }

  // --- Helper Methods ---

  // --- 게시물 액션 (좋아요)
}
