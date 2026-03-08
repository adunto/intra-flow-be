import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { UserService } from "src/modules/users/users.service";

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number; // issued at (발급 시간)
  exp?: number; // expiration (만료 시간)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const accessSecret = configService.get<string>("JWT_ACCESS_SECRET");

    if (!accessSecret) {
      throw new Error("Error: env file 내에 JWT_ACCESS_SECRET 값 오류");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    return user;
  }
}
