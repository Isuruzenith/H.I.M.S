import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  approved: "default",
  completed: "default",
  received: "default",
  medicine: "default",
  equipment: "secondary",
  consumable: "secondary",
  pending: "outline",
  draft: "outline",
  "near expiry": "outline",
  warning: "outline",
  expired: "destructive",
  critical: "destructive",
  cancelled: "destructive",
  inactive: "destructive",
  rejected: "destructive",
};

export function StatusBadge({ value }: { value?: string | number | null }) {
  const label = value === undefined || value === null || value === "" ? "N/A" : String(value);
  const variant = STATUS_VARIANTS[label.toLowerCase()] ?? "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}
