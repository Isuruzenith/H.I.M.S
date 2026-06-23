import {
  BarChart3,
  Building2,
  Boxes,
  ClipboardList,
  FileText,
  Gauge,
  History,
  Hospital,
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

export const APP_NAME = "H.I.M.S";
export const APP_TAGLINE = "Healthcare Inventory Management";
export const APP_ICON = Hospital;

type NavItem = {
  title: string;
  href: string;
  icon: typeof Gauge;
  roles?: readonly string[];
};

const ALL_EXCEPT_DEPT: readonly string[] = [
  "Admin",
  "InventoryManager",
  "Pharmacist",
  "ProcurementOfficer",
  "HospitalAdministrator",
];

const PROCUREMENT_ROLES: readonly string[] = [
  "Admin",
  "InventoryManager",
  "ProcurementOfficer",
  "HospitalAdministrator",
];

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: Gauge, roles: ALL_EXCEPT_DEPT }],
  },
  {
    label: "Stock Management",
    items: [
      { title: "Inventory", href: "/inventory", icon: Boxes, roles: ALL_EXCEPT_DEPT },
      { title: "Medicines", href: "/medicines", icon: Pill, roles: ALL_EXCEPT_DEPT },
      { title: "Equipment", href: "/equipment", icon: ShieldPlus, roles: ALL_EXCEPT_DEPT },
      { title: "Stock Batches", href: "/stock-batches", icon: Warehouse, roles: ALL_EXCEPT_DEPT },
      { title: "Issue Stock", href: "/issue-stock", icon: PackageCheck },
    ],
  },
  {
    label: "Procurement",
    items: [
      { title: "Suppliers", href: "/suppliers", icon: Truck, roles: PROCUREMENT_ROLES },
      { title: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList, roles: PROCUREMENT_ROLES },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/reports", icon: FileText, roles: ALL_EXCEPT_DEPT },
      { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ALL_EXCEPT_DEPT },
      {
        title: "Audit Trail",
        href: "/audit/stock-transactions",
        icon: History,
        roles: ["Admin", "InventoryManager", "HospitalAdministrator"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Staff", href: "/admin/staff", icon: Users, roles: ["Admin"] },
      { title: "Departments", href: "/admin/departments", icon: Building2, roles: ["Admin"] },
      { title: "Profile", href: "/profile", icon: UserCircle },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export const DEMO_STAFF_ID = 1;

export const FALLBACK_DEPARTMENTS = [
  { DepartmentID: 1, DepartmentName: "Emergency", Status: "Active" },
  { DepartmentID: 2, DepartmentName: "ICU", Status: "Active" },
  { DepartmentID: 3, DepartmentName: "Surgery", Status: "Active" },
];
