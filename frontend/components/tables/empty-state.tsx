import { Inbox } from "lucide-react";

export function EmptyState({ message = "No records found." }: { message?: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <Inbox className="size-6 text-muted-foreground/60" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
