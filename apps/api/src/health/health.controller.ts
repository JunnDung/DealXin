import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "../auth/decorators/public.decorator";
import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  async check(): Promise<{ status: string; database: string }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "up" };
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
  async readiness(): Promise<{ status: string; database: string }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "up" };
  }
}
