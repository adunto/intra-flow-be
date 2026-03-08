import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeTargetType } from 'src/common/common.enums';
import type { Repository } from 'typeorm';
import { Comment } from '../comments/comments.entity';
import { Post } from '../posts/posts.entity';
import type { CreateLikeDto } from './likes.dto';
import { Like } from './likes.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  // 좋아요 수행
  async toggleLike(userId: number, dto: CreateLikeDto) {
    const { targetId, targetType } = dto;

    // 1. 대상(Target)이 실제로 존재하는지 확인
    await this.checkTargetExists(targetId, targetType);

    // 2. 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.likesRepository.findOne({
      where: {
        userId,
        targetId,
        targetType,
      },
    });

    // 3. Toggle 로직 수행
    if (existingLike) {
      // [취소] 좋아요 삭제
      await this.likesRepository.remove(existingLike);
      await this.decrementLikeCount(targetId, targetType);
      return { message: '좋아요 취소', liked: false };
    } else {
      // [생성] 좋아요 추가
      const newLike = this.likesRepository.create({
        userId,
        targetId,
        targetType,
      });
      await this.likesRepository.save(newLike);
      await this.incrementLikeCount(targetId, targetType);
      return { message: '좋아요 성공', liked: true };
    }
  }

  // --- Helper Methods ---

  // 대상 존재 여부 확인
  private async checkTargetExists(
    targetId: string,
    targetType: LikeTargetType,
  ) {
    if (targetType === LikeTargetType.POST) {
      const post = await this.postsRepository.findOne({
        where: { id: targetId },
      });
      if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    } else if (targetType === LikeTargetType.COMMENT) {
      const comment = await this.commentsRepository.findOne({
        where: { id: targetId },
      });
      if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
  }

  // 좋아요 수 증가 (+1)
  private async incrementLikeCount(
    targetId: string,
    targetType: LikeTargetType,
  ) {
    if (targetType === LikeTargetType.POST) {
      await this.postsRepository.increment({ id: targetId }, 'likeCount', 1);
    } else {
      await this.commentsRepository.increment({ id: targetId }, 'likeCount', 1);
    }
  }

  // 좋아요 수 감소 (-1)
  private async decrementLikeCount(
    targetId: string,
    targetType: LikeTargetType,
  ) {
    if (targetType === LikeTargetType.POST) {
      await this.postsRepository.decrement({ id: targetId }, 'likeCount', 1);
    } else {
      await this.commentsRepository.decrement({ id: targetId }, 'likeCount', 1);
    }
  }
}
