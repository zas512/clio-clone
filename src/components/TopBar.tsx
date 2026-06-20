import { TimeTracker } from "@/components/TimeTracker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-3">
        <TimeTracker />
        <Avatar className="h-8 w-8">
          <AvatarFallback>SL</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
