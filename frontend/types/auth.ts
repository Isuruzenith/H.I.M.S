import type { Staff } from "@/types/stock";

export type UserRole =
  | "Admin"
  | "InventoryManager"
  | "Pharmacist"
  | "ProcurementOfficer"
  | "DepartmentStaff"
  | "HospitalAdministrator";

export type CurrentUser = Staff & {
  Role: UserRole | string;
  Username: string;
  Email: string;
};

export const STAFF_ROLES: UserRole[] = [
  "Admin",
  "InventoryManager",
  "Pharmacist",
  "ProcurementOfficer",
  "DepartmentStaff",
  "HospitalAdministrator",
];
