import { Injectable } from "@nestjs/common";
import { HealthCheck, HealthCheckResult, HealthCheckService as NestHealthCheckService } from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly health: NestHealthCheckService,
    private readonly prisma: PrismaService,
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
