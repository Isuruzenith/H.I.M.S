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

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: Gauge }],
  },
  {
    label: "Stock Management",
    items: [
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Medicines", href: "/medicines", icon: Pill },
      { title: "Equipment", href: "/equipment", icon: ShieldPlus },
      { title: "Stock Batches", href: "/stock-batches", icon: Warehouse },
      { title: "Issue Stock", href: "/issue-stock", icon: PackageCheck },
    ],
  },
  {
    label: "Procurement",
    items: [
      { title: "Suppliers", href: "/suppliers", icon: Truck },
      { title: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/reports", icon: FileText },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
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
