import {
  Activity,
  BarChart3,
  Building2,
  Boxes,
  ClipboardList,
  FileText,
  Gauge,
  History,
  PackageCheck,
  Pill,
  ShieldPlus,
  Truck,
  UserCircle,
  Users,
  Warehouse,
} from "lucide-react";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Inventory", href: "/inventory", icon: Boxes },
  { title: "Medicines", href: "/medicines", icon: Pill },
  { title: "Equipment", href: "/equipment", icon: ShieldPlus },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Stock Batches", href: "/stock-batches", icon: Warehouse },
  { title: "Issue Stock", href: "/issue-stock", icon: PackageCheck },
  { title: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    title: "Audit Trail",
    href: "/audit/stock-transactions",
    icon: History,
    roles: ["Admin", "InventoryManager", "HospitalAdministrator"],
  },
  { title: "Staff Admin", href: "/admin/staff", icon: Users, roles: ["Admin"] },
  { title: "Departments", href: "/admin/departments", icon: Building2, roles: ["Admin"] },
  { title: "Profile", href: "/profile", icon: UserCircle },
] as const;

export const APP_NAME = "HIMS Inventory";

export const DEMO_STAFF_ID = 1;

export const FALLBACK_DEPARTMENTS = [
  { DepartmentID: 1, DepartmentName: "Emergency", Status: "Active" },
  { DepartmentID: 2, DepartmentName: "ICU", Status: "Active" },
  { DepartmentID: 3, DepartmentName: "Surgery", Status: "Active" },
];

export const APP_ICON = Activity;
