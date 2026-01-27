import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/users/users.service';
import { jwtConstants } from './constants';

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number; // issued at (발급 시간)
  exp?: number; // expiration (만료 시간)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        const secret = jwtConstants.accessTokenSecret;
        done(null, secret);
      },
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    return user;
  }
}
