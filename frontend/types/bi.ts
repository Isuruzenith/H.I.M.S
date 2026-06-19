export interface DemandSummary {
  SummaryID?: number;
  ItemID: number;
  ItemName?: string;
  SummaryMonth?: number;
  SummaryYear?: number;
  TotalIssuedQuantity: number;
  AverageDailyUsage?: number;
  AverageMonthlyUsage?: number;
  ConsumptionValue?: number;
  DemandCategory?: string;
  ABCCategory?: string;
  RecommendedReorderQuantity?: number;
  GeneratedDate?: string;
}

export interface ABCAnalysisRow {
  ItemID: number;
  ItemName: string;
  TotalIssuedQuantity: number;
  ConsumptionValue: number;
  CumulativeValuePercent?: number;
  ABCCategory: "A" | "B" | "C" | string;
}

export interface ReorderRecommendation {
  ItemID: number;
  ItemName: string;
  ItemCategory?: string;
  TotalIssuedQuantity?: number;
  AverageMonthlyUsage?: number;
  CurrentStock?: number;
  SafetyStock?: number;
  LeadTimeDays?: number;
  DemandCategory?: string;
  RecommendedReorderQuantity?: number;
}

export interface ExpiryRiskRow {
  AlertLevel: string;
  BatchCount: number;
  QuantityAtRisk?: number;
}
