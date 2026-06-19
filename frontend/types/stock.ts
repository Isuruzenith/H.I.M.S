export interface Department {
  DepartmentID: number;
  DepartmentName: string;
  Location?: string;
  ContactNumber?: string;
  Status?: string;
  CreatedAt?: string;
}

export interface Staff {
  StaffID: number;
  DepartmentID?: number;
  DepartmentName?: string;
  FullName: string;
  Role?: string;
  Email?: string;
  Phone?: string;
  Username?: string;
  Status?: string;
  CreatedAt?: string;
}

export interface StockBatch {
  BatchID: number;
  ItemID: number;
  ItemName: string;
  SupplierID?: number;
  SupplierName?: string;
  BatchNumber: string;
  ReceivedDate?: string;
  ManufactureDate?: string;
  ExpiryDate?: string;
  QuantityReceived: number;
  QuantityAvailable: number;
  UnitCost?: number;
  DaysToExpiry?: number;
}

export interface StockTransaction {
  TransactionID: number;
  ItemName: string;
  BatchNumber?: string;
  TransactionType: string;
  Quantity: number;
  TransactionDate: string;
  ReferenceType?: string;
  ReferenceID?: number;
  StaffName?: string;
  Notes?: string;
}

export interface PurchaseOrder {
  PurchaseOrderID: number;
  SupplierID: number;
  SupplierName: string;
  CreatedByStaffID?: number;
  CreatedBy?: string;
  OrderDate?: string;
  ExpectedDeliveryDate?: string;
  CompletedDate?: string;
  OrderStatus: string;
  details?: PurchaseOrderDetail[];
}

export interface PurchaseOrderDetail {
  PurchaseOrderDetailID: number;
  ItemID: number;
  ItemName: string;
  OrderedQuantity: number;
  ReceivedQuantity?: number;
  UnitPrice: number;
}
