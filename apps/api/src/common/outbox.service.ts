import { Inject, Injectable } from "@nestjs/common";

import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OutboxService {
  constructor(@Inject(PRISMA_SERVICE) private readonly prisma: PrismaService) {}

  async emit(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: unknown,
  ): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        id: crypto.randomUUID(),
        aggregateType,
        aggregateId,
        eventType,
        payload: JSON.stringify(payload),
        published: false,
      },
    });
  }
}
