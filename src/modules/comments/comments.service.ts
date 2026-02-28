import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Repository } from 'typeorm';
import { Post } from '../posts/posts.entity';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  // 댓글 목록 조회
  async getCommentsByPostId(postId: string) {
    return this.commentsRepository.find({
      where: { postId },
      relations: ['user'], // 작성자 정보 포함
      select: {
        user: { id: true, username: true, email: true },
      },
      order: {
        createdAt: 'ASC', // 작성순 정렬
      },
    });
  }

  // 댓글 작성
  async createComment(
    userId: number,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const { content, parentId } = createCommentDto;

    // 게시물 존재 확인
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    // 게시물 없으면 404 Not Found 반환
    if (!post) {
      throw new NotFoundException(`게시물(ID: ${postId}을 찾을 수 없습니다.)`);
    }

    // 대댓글인 경우 (부모 댓글 존재 확인)
    let parentComment: Comment | null = null;
    // 부모 댓글이 있는 경우
    if (parentId) {
      parentComment = await this.commentsRepository.findOne({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(
          `부모 댓글(ID: ${parentId})을 찾을 수 없습니다.`,
        );
      }

      // 무결성 검사: 부모 댓글이 현재 게시물에 속해 있는지 확인
      // Post ID가 string(BigInt)이므로 문자열 비교
      if (parentComment.postId !== postId) {
        throw new BadRequestException(
          '부모 댓글이 해당 게시물에 존재하지 않습니다.',
        );
      }
    }

    // 새로운 댓글 생성
    const newComment = this.commentsRepository.create({
      content,
      userId,
      postId,
      parentId,
    });

    return this.commentsRepository.save(newComment);
  }

  // 댓글 수정
  async updateComment(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.checkCommentOwnership(commentId, userId);

    comment.content = updateCommentDto.content;
    return this.commentsRepository.save(comment);
  }

  // 댓글 삭제 (Soft Delete)
  async deleteComment(userId: number, commentId: number): Promise<void> {
    const comment = await this.checkCommentOwnership(commentId, userId);

    // softDelete 사용 (deletedAt 컬럼 업데이트)
    await this.commentsRepository.softDelete(comment.id);
  }

  // --- Helper: 권한 확인 ---

  private async checkCommentOwnership(commentId: number, userId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 수정/삭제할 수 있습니다.');
    }

    return comment;
  }
}
