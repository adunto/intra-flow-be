import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "../comments/comments.entity";
import { Like } from "../likes/likes.entity";
import { Post } from "../posts/posts.entity";
import { UsersController } from "./users.controller";
import { User } from "./users.entity";
import { UserService } from "./users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Comment, Like])],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
