import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/users.entity';
import { PostsController } from './posts.controller';
import { Post } from './posts.entity';
import { PostsService } from './posts.service';
import { CreatePostDto, SearchPostDto } from './posts.dto';

const mockPostService = {
  getAllPosts: jest.fn(),
  getPostById: jest.fn(),
  searchPosts: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

describe('PostController Test', () => {
  let controller: PostsController;
  let service: typeof mockPostService;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    username: 'tester',
    role: 'USER',
  } as User;

  const generateDummyPosts = (count: number): Post[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${i + 1}`, // ID: 1, 2, 3...
      title: `NestJS 게시물 제목 ${i + 1}`,
      content: `이것은 ${i + 1}번째 더미 내용입니다. Markdown 형식`,
      viewCount: i * 10,
      likeCount: 0,
      userId: 1,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    })) as Post[];
  };

  const dummyPosts = generateDummyPosts(5);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get(PostsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- [GET] 전체 게시물 조회 ---
  describe('getAllPosts', () => {
    it('should return an array of dummy posts', async () => {
      // Given: 서비스가 5개의 더미 게시물을 반환한다고 가정
      service.getAllPosts.mockResolvedValue(dummyPosts);

      // When
      const result = await controller.getAllPosts();

      // Then
      expect(service.getAllPosts).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(5); // 3개가 왔는지 확인
      expect(result).toEqual(dummyPosts);
      expect(result[0].title).toBe('NestJS 게시물 제목 1'); // 첫 번째 데이터 확인
    });
  });

  // --- [GET] 단일 게시물 상세 조회 ---
  describe('getPostById', () => {
    it('단일 게시물 조회', async () => {
      // Given: ID가 '1'인 게시물 반환 가정
      const targetPost = dummyPosts[0];
      service.getPostById.mockResolvedValue(targetPost);

      // When
      const result = await controller.getPostById('1');

      // Then
      expect(service.getPostById).toHaveBeenCalledWith('1');
      expect(result).toEqual(targetPost);
      expect(result.id).toBe('1');
    });
  });

  // --- [GET] 게시물 검색 ---
  describe('searchPosts', () => {
    it('should return filtered posts based on search criteria', async () => {
      // Given: '제목 2'를 검색했을 때 2번째 게시물만 나온다고 가정
      const searchDto: SearchPostDto = {
        searchType: ['TITLE'],
        searchItem: '제목 2',
      };

      const filteredResult = [dummyPosts[1]]; // ID 2번 게시물
      service.searchPosts.mockResolvedValue(filteredResult);

      // When
      const result = await controller.searchPosts(searchDto);

      // Then
      expect(service.searchPosts).toHaveBeenCalledWith({
        type: searchDto.searchType,
        item: searchDto.searchItem,
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('제목 2');
    });
  });

  // --- [POST] 게시물 작성 ---
  describe('createPost', () => {
    it('should create and return a new post', async () => {
      // Given
      const createPostDto: CreatePostDto = {
        title: '새로운 글',
        content: '새로운 내용',
      };

      const newPost = {
        ...dummyPosts[0], // 기존 더미 형식을 빌려옴
        id: '99',
        title: createPostDto.title,
        content: createPostDto.content,
      };

      service.createPost.mockResolvedValue(newPost);

      // When
      // @CurrentUser()가 넘겨주는 user 객체와 Body DTO 전달
      const result = await controller.createPost(mockUser, createPostDto);

      // Then
      expect(service.createPost).toHaveBeenCalledWith(
        mockUser.id,
        createPostDto,
      );
      expect(result.id).toBe('99');
      expect(result.title).toBe('새로운 글');
    });
  });

  // --- [PUT] 게시물 수정 ---
  describe('updatePost', () => {
    it('should update and return the modified post', async () => {
      // Given
      const updatePostDto: CreatePostDto = {
        title: '수정된 제목',
        content: '수정된 내용',
      };

      const updatedPost = {
        ...dummyPosts[0],
        title: updatePostDto.title,
        content: updatePostDto.content,
      };

      service.updatePost.mockResolvedValue(updatedPost);

      // When
      const result = await controller.updatePost('1', mockUser, updatePostDto);

      // Then
      expect(service.updatePost).toHaveBeenCalledWith(
        '1',
        mockUser.id,
        updatePostDto,
      );
      expect(result.title).toBe('수정된 제목');
    });
  });

  // --- [DELETE] 게시물 삭제 ---
  describe('deletePost', () => {
    it('should call delete service with correct parameters', async () => {
      // Given
      service.deletePost.mockResolvedValue(undefined); // void 반환

      // When
      await controller.deletePost('1', mockUser);

      // Then
      expect(service.deletePost).toHaveBeenCalledWith('1', mockUser.id);
    });
  });
});
