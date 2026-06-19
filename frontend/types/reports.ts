export interface LowStockReportRow {
  ItemID: number;
  ItemName: string;
  ItemCategory: string;
  UnitOfMeasure?: string;
  CurrentStock: number;
  ReorderLevel: number;
  MaximumStockLevel?: number;
  RecommendedReorderQuantity?: number;
  StockStatus?: string;
}

export interface ExpiringSoonReportRow {
  BatchID: number;
  ItemID?: number;
  ItemName: string;
  BatchNumber: string;
  QuantityAvailable: number;
  ExpiryDate?: string;
  DaysToExpiry?: number;
  AlertLevel?: string;
}

export interface DepartmentConsumptionRow {
  DepartmentID?: number;
  DepartmentName: string;
  ItemID?: number;
  ItemName: string;
  UsageMonth?: number;
  UsageYear?: number;
  TotalIssuedQuantity: number;
}

export interface SupplierPerformanceRow {
  SupplierID?: number;
  SupplierName: string;
  TotalOrders?: number;
  CompletedOrders?: number;
  CancelledOrders?: number;
  DelayedOrders?: number;
  AverageLeadTimeDays?: number;
  AverageItemCost?: number;
}
