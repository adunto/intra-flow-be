import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();

    // accessToken
    const token: string =
      client.handshake.auth.accessToken ||
      client.handshake.headers["authorization"]?.split(" ")[1];

    // 토큰이 없다면 실패 처리
    if (!token) {
      throw new WsException("인증 토큰이 없습니다.");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // 클라이언트 소켓에 'user' 프로퍼티 추가 (사용자 정보)
      client["user"] = payload;

      return true;
    } catch (error) {
      throw new WsException("인증 토큰이 유효하지 않습니다.");
    }
  }
}
