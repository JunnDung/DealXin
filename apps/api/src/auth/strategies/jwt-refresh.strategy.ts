import { Injectable } from "@nestjs/common";
import { type ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: config.get<string>(
        "JWT_REFRESH_SECRET",
        "change_me_32_chars_minimum",
      ),
      passReqToCallback: false,
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    return payload;
  }
}
