import { Inject, Injectable } from "@nestjs/common";
import {
  HealthCheck,
  type HealthCheckResult,
  type HealthCheckService as NestHealthCheckService,
} from "@nestjs/terminus";

import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly health: NestHealthCheckService,
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaService,
  ) {}

  @HealthCheck()
  async isHealthy(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: "up" } };
      },
    ]);
  }

  async pingCheck(name: string): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { [name]: { status: "up" } };
      },
    ]);
  }
}
