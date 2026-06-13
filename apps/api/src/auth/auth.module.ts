import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AUTH_SERVICE, JWT_SERVICE } from "../common/di-tokens";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./guards/roles.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error("JWT_SECRET environment variable is required");
        }
        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>("JWT_ACCESS_EXPIRY", "15m"),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_SERVICE, useExisting: AuthService },
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    { provide: JWT_SERVICE, useExisting: JwtService },
  ],
  exports: [AuthService, AUTH_SERVICE, JWT_SERVICE],
})
export class AuthModule {}
