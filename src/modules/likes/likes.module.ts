import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';
import { Like } from './likes.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, Like])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
