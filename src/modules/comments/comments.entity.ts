import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/posts.entity';
import { User } from '../users/users.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '댓글 ID' })
  id: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @Column({ type: 'int', default: 0, name: 'like_count' })
  @ApiProperty({ description: '좋아요 개수', default: 0 })
  likeCount: number;

  // --- 타임 스탬프 ---

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '작성일' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' }) // Soft Delete
  @ApiProperty({ description: '삭제일', required: false })
  deletedAt?: Date;

  // --- relations ---

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'post_id', type: 'bigint' })
  @ApiProperty({ description: '게시물 ID' })
  postId: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  // --- 대댓글 (Self Referencing) ---

  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @Column({ name: 'parent_id', nullable: true })
  @ApiProperty({ description: '부모 댓글 ID (대댓글일 경우)', required: false })
  parentId?: number;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];
}
