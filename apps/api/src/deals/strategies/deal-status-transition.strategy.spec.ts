import { BadRequestException } from "@nestjs/common";
import { DealStatus } from "@prisma/client";

import { DealStatusTransitionStrategy } from "./deal-status-transition.strategy";

describe("DealStatusTransitionStrategy", () => {
  let strategy: DealStatusTransitionStrategy;

  beforeEach(() => {
    strategy = new DealStatusTransitionStrategy();
  });

  describe("validateTransition", () => {
    it("should allow PENDING -> APPROVED by ADMIN", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.APPROVED,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).not.toThrow();
    });

    it("should allow PENDING -> REJECTED by ADMIN", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.REJECTED,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).not.toThrow();
    });

    it("should allow PENDING -> EXPIRED by ADMIN", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.EXPIRED,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).not.toThrow();
    });

    it("should NOT allow PENDING -> APPROVED by USER", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.APPROVED,
          userRole: "USER",
          dealCreatedById: "user-1",
          requestingUserId: "user-1",
        }),
      ).toThrow(BadRequestException);
    });

    it("should NOT allow PENDING -> APPROVED by OWNER", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.APPROVED,
          userRole: "USER",
          dealCreatedById: "user-1",
          requestingUserId: "user-1",
        }),
      ).toThrow(BadRequestException);
    });

    it("should NOT allow APPROVED -> PENDING by ADMIN", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.APPROVED,
          targetStatus: DealStatus.PENDING,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).toThrow(BadRequestException);
    });

    it("should allow APPROVED -> EXPIRED by ADMIN", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.APPROVED,
          targetStatus: DealStatus.EXPIRED,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).not.toThrow();
    });

    it("should throw when transitioning to same status", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.PENDING,
          targetStatus: DealStatus.PENDING,
          userRole: "ADMIN",
          dealCreatedById: "user-1",
          requestingUserId: "admin-1",
        }),
      ).toThrow(BadRequestException);
    });

    it("should throw for invalid transition path", () => {
      expect(() =>
        strategy.validateTransition({
          currentStatus: DealStatus.EXPIRED,
          targetStatus: DealStatus.PENDING,
          userRole: "USER",
          dealCreatedById: "user-1",
          requestingUserId: "user-1",
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe("getAvailableTransitions", () => {
    it("should return APPROVED, REJECTED, EXPIRED for ADMIN on PENDING deal", () => {
      const transitions = strategy.getAvailableTransitions(
        DealStatus.PENDING,
        "ADMIN",
      );
      expect(transitions).toContain(DealStatus.APPROVED);
      expect(transitions).toContain(DealStatus.REJECTED);
      expect(transitions).toContain(DealStatus.EXPIRED);
    });

    it("should return empty array for USER on PENDING deal", () => {
      const transitions = strategy.getAvailableTransitions(
        DealStatus.PENDING,
        "USER",
      );
      expect(transitions).toHaveLength(0);
    });

    it("should return EXPIRED, REJECTED for ADMIN on APPROVED deal", () => {
      const transitions = strategy.getAvailableTransitions(
        DealStatus.APPROVED,
        "ADMIN",
      );
      expect(transitions).toContain(DealStatus.EXPIRED);
      expect(transitions).toContain(DealStatus.REJECTED);
    });
  });
});
