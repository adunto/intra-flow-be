import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 모든 유저 찾기
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // ID 로 유저 찾기
  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneById(id);
  }

  // 유저가 작성한 게시물 목록 조회
  async getUserPosts(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['posts'],
      order: {
        posts: {
          createdAt: 'DESC',
        },
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user.posts;
  }
}
