import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckResult,
} from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "../auth/decorators/public.decorator";
import { PrismaHealthIndicator } from "./prisma-health.indicator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly db: PrismaHealthIndicator) {}

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
