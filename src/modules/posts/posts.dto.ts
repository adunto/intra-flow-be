import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchPostDto {
  @ApiProperty({
    description: '검색 범위',
    example: 'AUTHOR | TITLE | CONTENT',
    required: true,
  })
  searchType: Array<'AUTHOR' | 'TITLE' | 'CONTENT'>;

  @ApiProperty({
    description: '검색어',
    example: '검색어',
    required: true,
  })
  @IsString()
  searchItem: string;
}

export class CreatePostDto {
  @ApiProperty({
    description: '글 제목',
    example: 'OOOO 주간 업무 보고입니다.',
    required: true,
  })
  @MinLength(1)
  @IsString()
  title: string;

  @ApiProperty({
    description: '글 내용',
    example: '...글 내용',
    required: true,
  })
  @MinLength(1)
  @IsString()
  content: string;
}

export class UpdatePostDto {
  @ApiProperty({
    description: '수정한 글 제목',
    example: 'OOOO 주간 업무 보고입니다.',
    required: true,
  })
  @MinLength(1)
  @IsString()
  title: string;

  @ApiProperty({
    description: '수정한 글 내용',
    example: '...글 내용',
    required: true,
  })
  @MinLength(1)
  @IsString()
  content: string;
}
