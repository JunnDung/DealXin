import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  type HealthCheckResult,
  type HealthCheckService,
} from "@nestjs/terminus";

import { type PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiTags("Health")
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: "up" } };
      },
    ]);
  }

  @Get("live")
  @ApiTags("Health")
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  @ApiTags("Health")
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: "up" } };
      },
    ]);
  }
}
