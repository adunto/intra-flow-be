import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchType {
  AUTHOR = 'AUTHOR',
  TITLE = 'TITLE',
  CONTENT = 'CONTENT',
}

export class PaginationDto {
  @ApiProperty({ description: '페이지 번호', default: 1, required: false })
  @Type(() => Number) // 쿼리 스트링은 문자열이므로 숫자로 변환
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: '페이지당 개수', default: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

export class SearchPostDto extends PaginationDto {
  @ApiProperty({
    description: '검색 조건 (배열 가능)',
    enum: SearchType,
    isArray: true,
    required: false, // 검색 없이 전체 조회일 수도 있으므로 optional
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SearchType, { each: true })
  searchType?: SearchType[];

  @ApiProperty({ description: '검색어', required: false })
  @IsOptional()
  @IsString()
  searchItem?: string;
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
