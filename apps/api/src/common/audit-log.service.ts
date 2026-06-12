import { Injectable } from "@nestjs/common";

import { type PrismaService } from "../prisma/prisma.service";

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    const data: {
      action: string;
      userId?: string;
      entityType?: string;
      entityId?: string;
      metadata?: string | null;
      ipAddress?: string;
      userAgent?: string;
    } = { action: input.action };

    if (input.userId !== undefined) data.userId = input.userId;
    if (input.entityType !== undefined) data.entityType = input.entityType;
    if (input.entityId !== undefined) data.entityId = input.entityId;
    if (input.metadata !== undefined)
      data.metadata = JSON.stringify(input.metadata);
    if (input.ipAddress !== undefined) data.ipAddress = input.ipAddress;
    if (input.userAgent !== undefined) data.userAgent = input.userAgent;

    await this.prisma.auditLog.create({ data });
  }
}
