import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { AppErrorFilter } from "./common/filters/app-error.filter";
import { logger } from "./common/logger/pino.logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AppErrorFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api", { exclude: ["health", "api/docs"] });

  const config = new DocumentBuilder()
    .setTitle("DealXin API")
    .setDescription("Real-time Deal Aggregator Platform API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.info(`API running on http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  logger.error(err);
  process.exit(1);
});
