import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiTags("Health")
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck("database"),
    ]);
  }

  @Get("live")
  @ApiTags("Health")
  liveness(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  @ApiTags("Health")
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck("database"),
    ]);
  }
}
