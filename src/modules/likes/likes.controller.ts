import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/user.decorator";
import type { User } from "../users/users.entity";
import type { CreateLikeDto } from "./likes.dto";
import type { LikesService } from "./likes.service";

@ApiTags("Likes")
@Controller()
export class LikesController {
  constructor(private likesService: LikesService) {}

  @ApiOperation({ summary: "좋아요 토글 (생성/취소)" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "성공 (liked: true/false)" })
  @ApiResponse({ status: 404, description: "대상을 찾을 수 없음" })
  @UseGuards(AuthGuard("jwt"))
  @Post()
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @CurrentUser() user: User,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    return this.likesService.toggleLike(user.id, createLikeDto);
  }
}
