export const DEAL_REPOSITORY = Symbol("DEAL_REPOSITORY");

export type {
  CreateDealData,
  DealFilterParams,
  DealRepository,
} from "../repositories/deal.repository";
export * from "./deal-scoring.strategy";
export * from "./deal-status-transition.strategy";
