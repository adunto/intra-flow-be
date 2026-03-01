import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용', example: '정말 유익한 글이네요!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID (대댓글일 경우에만 입력)',
    example: 1,
    required: false,
  })
  @IsOptional()
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: '수정할 내용', example: '수정된 내용입니다.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
