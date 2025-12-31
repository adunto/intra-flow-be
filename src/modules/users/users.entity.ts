import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../posts/posts.entity';
import { UserRole } from 'src/common/common.enums';
import { Comment } from '../comments/comments.entity';
import { Like } from '../likes/likes.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '사용자 ID', example: 1 })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: '사용자 EMAIL', example: 'user@example.com' })
  email: string;

  @Column({ select: false }) // select : false -> 일반적인 조회(find) 시 비밀번호 노출 방지
  @ApiProperty({ description: '사용자 PASSWORD', writeOnly: true })
  password: string;

  @Column({ length: 20 })
  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @ApiProperty({
    description: '사용자 권한',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  profileImage?: string;

  // --- 타임 스탬프 ---

  @CreateDateColumn()
  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  // --- Soft Delete ---
  @DeleteDateColumn()
  @ApiProperty({ description: '삭제일', required: false })
  deletedAt?: Date | null;

  // --- 작성한 게시물 ---
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  // --- 작성한 댓글 ---
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // --- 좋아요 ---
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
