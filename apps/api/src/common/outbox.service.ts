import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

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
