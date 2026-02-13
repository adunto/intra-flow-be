import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LikeTargetType } from 'src/common/common.enums';

@Entity('likes')
@Unique('uk_like_user_target', ['userId', 'targetId', 'targetType'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: LikeTargetType,
    default: LikeTargetType.POST,
  })
  @ApiProperty({
    description: '대상 타입 (POST | COMMENT)',
    enum: LikeTargetType,
  })
  targetType: LikeTargetType;

  // --- 타임 스탬프 ---

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- relations ---

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_id', type: 'bigint' })
  @ApiProperty({ description: '대상 ID (Post ID or Comment ID)' })
  targetId: string;
}
