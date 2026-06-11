import {
  AggressiveDealScoringStrategy,
  type DealScoreContext,
  DefaultDealScoringStrategy,
} from "./deal-scoring.strategy";

describe("DealScoringStrategy", () => {
  describe("DefaultDealScoringStrategy", () => {
    let strategy: DefaultDealScoringStrategy;

    beforeEach(() => {
      strategy = new DefaultDealScoringStrategy();
    });

    it("should return 0 for expired deals", () => {
      const context: DealScoreContext = {
        discountPercent: 50,
        viewCount: 1000,
        clickCount: 100,
        voteCount: 100,
        upvotes: 90,
        downvotes: 10,
        originalPrice: 1000,
        salePrice: 500,
        daysUntilExpiry: -5,
        isExpired: true,
      };
      expect(strategy.calculateScore(context)).toBe(0);
    });

    it("should score higher for bigger discounts", () => {
      const base: DealScoreContext = {
        discountPercent: 50,
        viewCount: 100,
        clickCount: 10,
        voteCount: 10,
        upvotes: 10,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 500,
        daysUntilExpiry: null,
        isExpired: false,
      };

      const lowDiscount = strategy.calculateScore({
        ...base,
        discountPercent: 10,
      });
      const highDiscount = strategy.calculateScore({
        ...base,
        discountPercent: 50,
      });
      expect(highDiscount).toBeGreaterThan(lowDiscount);
    });

    it("should give expiry bonus for deals expiring within 3 days", () => {
      const base: DealScoreContext = {
        discountPercent: 30,
        viewCount: 100,
        clickCount: 10,
        voteCount: 10,
        upvotes: 10,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 700,
        daysUntilExpiry: null,
        isExpired: false,
      };

      const expiringSoon = strategy.calculateScore({
        ...base,
        daysUntilExpiry: 2,
      });
      const notExpiring = strategy.calculateScore({
        ...base,
        daysUntilExpiry: 10,
      });
      expect(expiringSoon).toBeGreaterThan(notExpiring);
    });

    it("should cap score at 100", () => {
      const context: DealScoreContext = {
        discountPercent: 100,
        viewCount: 10000,
        clickCount: 5000,
        voteCount: 5000,
        upvotes: 5000,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 0,
        daysUntilExpiry: 1,
        isExpired: false,
      };
      expect(strategy.calculateScore(context)).toBeLessThanOrEqual(100);
    });

    it("should return minimum 0 for negative score", () => {
      const context: DealScoreContext = {
        discountPercent: 0,
        viewCount: 0,
        clickCount: 0,
        voteCount: 0,
        upvotes: 0,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 1000,
        daysUntilExpiry: null,
        isExpired: false,
      };
      expect(strategy.calculateScore(context)).toBeGreaterThanOrEqual(0);
    });
  });

  describe("AggressiveDealScoringStrategy", () => {
    let strategy: AggressiveDealScoringStrategy;

    beforeEach(() => {
      strategy = new AggressiveDealScoringStrategy();
    });

    it("should weight discount more heavily than default", () => {
      const base: DealScoreContext = {
        discountPercent: 50,
        viewCount: 0,
        clickCount: 0,
        voteCount: 0,
        upvotes: 0,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 500,
        daysUntilExpiry: null,
        isExpired: false,
      };

      const aggressive = new AggressiveDealScoringStrategy();
      const defaultS = new DefaultDealScoringStrategy();

      expect(aggressive.calculateScore(base)).toBeGreaterThan(
        defaultS.calculateScore(base),
      );
    });

    it("should cap at 100", () => {
      const context: DealScoreContext = {
        discountPercent: 100,
        viewCount: 0,
        clickCount: 0,
        voteCount: 100,
        upvotes: 100,
        downvotes: 0,
        originalPrice: 1000,
        salePrice: 0,
        daysUntilExpiry: null,
        isExpired: false,
      };
      expect(strategy.calculateScore(context)).toBeLessThanOrEqual(100);
    });
  });
});
