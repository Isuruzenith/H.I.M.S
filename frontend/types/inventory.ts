export type ItemCategory = "Medicine" | "Equipment" | "Consumable";
export type ItemStatus = "Active" | "Inactive";

export interface InventoryItem {
  ItemID: number;
  ItemName: string;
  ItemCategory: ItemCategory | string;
  UnitOfMeasure: string;
  ReorderLevel: number;
  MaximumStockLevel: number;
  ItemStatus: ItemStatus | string;
  CurrentStock?: number;
}

export interface Medicine extends InventoryItem {
  GenericName?: string;
  BrandName?: string;
  Dosage?: string;
  DrugForm?: string;
  StorageCondition?: string;
  PrescriptionRequired?: boolean;
}

export interface Equipment extends InventoryItem {
  EquipmentType?: string;
  WarrantyMonths?: number;
  MaintenanceRequired?: boolean;
  ServiceFrequencyMonths?: number;
}
