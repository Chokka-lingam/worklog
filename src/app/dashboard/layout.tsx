import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              WorkLog
            </p>
            <h1 className="text-xl font-bold text-slate-900">Workspace</h1>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Logout
            </Button>
          </form>
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
