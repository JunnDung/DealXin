import { BadRequestException } from "@nestjs/common";
import { type DealStatus } from "@prisma/client";

export interface StatusTransitionContext {
  currentStatus: DealStatus;
  targetStatus: DealStatus;
  userRole: string;
  dealCreatedById: string;
  requestingUserId: string;
}

export class DealStatusTransitionStrategy {
  private readonly transitions: Record<
    DealStatus,
    Partial<Record<DealStatus, string[]>>
  > = {
    PENDING: {
      APPROVED: ["ADMIN"],
      REJECTED: ["ADMIN"],
      EXPIRED: ["ADMIN"],
    },
    APPROVED: {
      EXPIRED: ["ADMIN"],
      REJECTED: ["ADMIN"],
    },
    REJECTED: {
      APPROVED: ["ADMIN"],
      PENDING: [],
    },
    EXPIRED: {
      APPROVED: ["ADMIN"],
    },
  };

  validateTransition(context: StatusTransitionContext): void {
    const { currentStatus, targetStatus, userRole } = context;

    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Deal is already in "${targetStatus}" status`,
      );
    }

    const allowedRoles = this.transitions[currentStatus]?.[targetStatus];

    if (!allowedRoles) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${targetStatus}"`,
      );
    }

    if (!allowedRoles.includes(userRole)) {
      throw new BadRequestException(
        `Role "${userRole}" is not allowed to transition deal from "${currentStatus}" to "${targetStatus}"`,
      );
    }
  }

  getAvailableTransitions(
    currentStatus: DealStatus,
    userRole: string,
  ): DealStatus[] {
    const transitions = this.transitions[currentStatus];
    if (!transitions) return [];

    return Object.entries(transitions)
      .filter(([, roles]) => roles.includes(userRole))
      .map(([status]) => status as DealStatus);
  }
}
