import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AppConfigModule, CommonModule],
  controllers: [HealthController],
})
export class AppModule {}
