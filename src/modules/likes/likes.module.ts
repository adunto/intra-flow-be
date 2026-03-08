import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/comments.entity';
import { Post } from '../posts/posts.entity';
import { LikesController } from './likes.controller';
import { Like } from './likes.entity';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, Like])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
