export interface DealScoreContext {
  discountPercent: number;
  viewCount: number;
  clickCount: number;
  voteCount: number;
  upvotes: number;
  downvotes: number;
  originalPrice: number;
  salePrice: number;
  daysUntilExpiry: number | null;
  isExpired: boolean;
}

export interface DealScoringStrategy {
  calculateScore(context: DealScoreContext): number;
  getStrategyName(): string;
}

export class DefaultDealScoringStrategy implements DealScoringStrategy {
  getStrategyName() {
    return "default";
  }

  calculateScore(context: DealScoreContext): number {
    const {
      discountPercent,
      upvotes,
      downvotes,
      viewCount,
      daysUntilExpiry,
      isExpired,
    } = context;

    if (isExpired) return 0;

    const voteNet = upvotes - downvotes;
    const voteScore = Math.max(0, voteNet) * 5;

    let engagementScore = 0;
    if (viewCount > 0) {
      const clickRate = context.clickCount / viewCount;
      engagementScore = Math.min(20, Math.round(clickRate * 100));
    }

    const discountScore = Math.min(30, Math.round(discountPercent * 0.6));

    let expiryBonus = 0;
    if (
      daysUntilExpiry !== null &&
      daysUntilExpiry <= 3 &&
      daysUntilExpiry >= 0
    ) {
      expiryBonus = 10;
    }

    const rawScore = discountScore + voteScore + engagementScore + expiryBonus;

    return Math.min(100, Math.max(0, rawScore));
  }
}

export class AggressiveDealScoringStrategy implements DealScoringStrategy {
  getStrategyName() {
    return "aggressive";
  }

  calculateScore(context: DealScoreContext): number {
    const { discountPercent } = context;

    const discountScore = Math.min(40, Math.round(discountPercent * 0.8));

    const voteNet = context.upvotes - context.downvotes;
    const voteScore = Math.max(0, voteNet) * 8;

    const base = discountScore + voteScore;

    return Math.min(100, Math.max(0, base));
  }
}
