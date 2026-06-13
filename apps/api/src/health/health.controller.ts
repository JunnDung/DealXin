import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, type HealthCheckResult } from "@nestjs/terminus";

import { Public } from "../auth/decorators/public.decorator";
import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaHealthIndicator } from "./prisma-health.indicator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly db: PrismaHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.db.pingCheck("database");
  }

  @Public()
  @Get("live")
  @ApiTags("Health")
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Public()
  @Get("ready")
  @ApiTags("Health")
  readiness(): Promise<HealthCheckResult> {
    return this.db.pingCheck("database");
  }
}
