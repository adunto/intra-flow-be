import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiProperty({ description: '게시물 ID', example: '1' })
  id: string;

  @Column({ length: 255 })
  @ApiProperty({ description: '제목', example: '나는 누구인가?' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: '내용 (Markdown)', example: '# 반갑습니다. ...' })
  content: string;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  @ApiProperty({ description: '조회수', default: 0 })
  viewCount: number;

  // (사용자[User] : 게시물[Post]) (1:N)
  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    eager: false, // 조회 시 자동으로 JOIN 하지 않음 (성능 최적화)
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  @ApiProperty({ description: '작성자 User ID' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}
