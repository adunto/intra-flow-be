import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자)',
    example: 'password123@',
    minLength: 6,
  })
  @MinLength(6)
  @Matches(/^[a-zA-Z0-9!@#$%^&*]*$/, {
    message:
      '비밀번호는 오직 알파벳과 숫자, 특수 기호로만 작성하실 수 있습니다.',
  })
  password: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @IsString()
  @MaxLength(20)
  username: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123@' })
  @IsString()
  password: string;
}
