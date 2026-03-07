import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeTargetType } from 'src/common/common.enums';

export class CreateLikeDto {
  @ApiProperty({
    description: '좋아요 대상의 ID (Post ID 또는 Comment ID)',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({
    description: '좋아요 대상 타입',
    enum: LikeTargetType,
    example: LikeTargetType.POST,
  })
  @IsEnum(LikeTargetType)
  targetType: LikeTargetType;
}
