import Link from "next/link";
import { ArrowRight, Clock3, LayoutDashboard, ListTodo, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";

const stats = [
  { label: "Productive today", value: "6h 40m", icon: Clock3 },
  { label: "Tasks completed", value: "12", icon: ListTodo },
  { label: "Active projects", value: "4", icon: LayoutDashboard },
  { label: "Time tracked", value: "7h 10m", icon: TimerReset },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              WorkLog
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Personal Work Management</h1>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Today&apos;s overview</h2>
            <div className="mt-6 space-y-4">
              {[
                ["Productive hours", "6h 40m"],
                ["Break time", "35m"],
                ["Lunch", "1h 10m"],
                ["Target completion", "82%"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Timer</h2>
            <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Running session</p>
              <h3 className="mt-3 text-2xl font-bold">Bug investigation</h3>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
                <span>Task</span>
                <span>02:46:12</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1">Pause</Button>
              <Button className="flex-1">Complete</Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
