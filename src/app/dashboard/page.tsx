import { AlertCircle, CheckCircle2, Clock3, ListTodo, Target } from "lucide-react";

import { AddTaskForm } from "@/components/add-task-form";
import { TaskActionButton } from "@/components/task-action-button";
import { createTask, deleteTask, updateTaskStatus } from "@/lib/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; priority?: string; error?: string }> | { status?: string; priority?: string; error?: string };
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const dashboardError = resolvedSearchParams.error ? decodeURIComponent(resolvedSearchParams.error) : "";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4" />
          Please sign in to view your dashboard.
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, timezone")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  const workspaceIds = Array.from(
    new Set((memberships ?? []).map((member) => member.workspace_id).filter(Boolean)),
  );
  const selectedStatus = resolvedSearchParams.status ?? "all";
  const selectedPriority = resolvedSearchParams.priority ?? "all";

  let taskQuery: { data: any[] | null } = { data: [] };

  if (workspaceIds.length > 0) {
    let query = supabase
      .from("tasks")
      .select("id, title, description, status, priority, start_date, due_date, notes, tags, created_at")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false });

    if (selectedStatus !== "all") {
      query = query.eq("status", selectedStatus);
    }

    if (selectedPriority !== "all") {
      query = query.eq("priority", selectedPriority);
    }

    const result = await query;
    taskQuery = {
      data: result.data ?? [],
    };
  }

  const tasks = taskQuery.data ?? [];
  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled").length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const pausedTasks = tasks.filter((task) => task.status === "paused").length;
  const cancelledTasks = tasks.filter((task) => task.status === "cancelled").length;

  const getAssignedTo = (task: { description?: string | null }) => {
    const match = task.description?.match(/Assigned to:\s*(.*?)(?:\n|$)/i);
    return match?.[1]?.trim() ?? "-";
  };

  const getFieldValue = (value: string | null | undefined, label: string) => {
    if (!value) return "-";
    const match = value.match(new RegExp(`${label}:\\s*(.*?)(?:\\n\\n|$)`, "is"));
    return match?.[1]?.trim() || "-";
  };

  const getDescriptionText = (task: { description?: string | null }) => {
    const raw = task.description ?? "";
    const parts = raw.split(/\n\s*\n/).filter(Boolean);
    const firstPlain = parts.find((part) => !/^(Assigned to:|Start time:|Completion time:|Evidence:|Remarks:|What I did:)/i.test(part));
    return firstPlain?.trim() || raw.trim() || "-";
  };

  const stats = [
    { label: "Open", value: String(openTasks), icon: ListTodo },
    { label: "In progress", value: String(inProgressTasks), icon: Clock3 },
    { label: "Completed", value: String(completedTasks), icon: CheckCircle2 },
    { label: "Paused / Cancelled", value: String(pausedTasks + cancelledTasks), icon: AlertCircle },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Dashboard</p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,4rem)] font-black leading-none tracking-[-0.04em] text-slate-900">
          Welcome, {profile?.full_name ?? "there"}
        </h2>
      </header>

      {dashboardError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      ) : null}

      <section className="grid grid-cols-4 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-h-[120px] flex-col justify-between rounded border border-slate-300 bg-white p-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600">
                <Icon className="h-2.5 w-2.5" />
              </div>
            </div>
            <div className="flex items-end justify-center text-[2.2rem] font-black tracking-[-0.06em] text-slate-900">
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[480px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Add a task</h3>
          <AddTaskForm />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {tasks.length} total
            </div>
          </div>

          <form method="get" className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label htmlFor="status" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              >
                <option value="all">All</option>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue={selectedPriority}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" variant="secondary" className="w-full md:w-auto">
                Apply
              </Button>
            </div>
          </form>

          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No tasks yet. Add your first one to start tracking work.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="w-[85px] border border-slate-200 px-2 py-2 font-semibold">Date</th>
                    <th className="w-[120px] border border-slate-200 px-2 py-2 font-semibold">Assigned To</th>
                    <th className="w-[180px] border border-slate-200 px-2 py-2 font-semibold">Task Title</th>
                    <th className="w-[220px] border border-slate-200 px-2 py-2 font-semibold">Description</th>
                    <th className="w-[90px] border border-slate-200 px-2 py-2 font-semibold">Priority</th>
                    <th className="w-[120px] border border-slate-200 px-2 py-2 font-semibold">Start Time</th>
                    <th className="w-[120px] border border-slate-200 px-2 py-2 font-semibold">Completion Time</th>
                    <th className="w-[120px] border border-slate-200 px-2 py-2 font-semibold">Status</th>
                    <th className="w-[220px] border border-slate-200 px-2 py-2 font-semibold">What I Did</th>
                    <th className="w-[180px] border border-slate-200 px-2 py-2 font-semibold">Evidence / Link</th>
                    <th className="w-[220px] border border-slate-200 px-2 py-2 font-semibold">Remarks</th>
                    <th className="w-[110px] border border-slate-200 px-2 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="align-top">
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        {task.start_date ?? "-"}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        {getAssignedTo(task)}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <div className="font-medium text-slate-900">{task.title}</div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <div className="max-w-[200px] break-words whitespace-pre-line">
                          {getDescriptionText(task)}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          {task.priority}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        {task.description ? getFieldValue(task.description, "Start time") : "-"}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        {task.description ? getFieldValue(task.description, "Completion time") : "-"}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <form action={updateTaskStatus} className="space-y-2">
                          <input type="hidden" name="taskId" value={task.id} />
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-slate-300"
                          >
                            <option value="not_started">Not started</option>
                            <option value="in_progress">In progress</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <TaskActionButton variant="secondary" size="sm" className="w-full" pendingLabel="Updating...">
                            Update
                          </TaskActionButton>
                        </form>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <div className="max-w-[200px] break-words whitespace-pre-line">
                          {getFieldValue(task.description, "What I did")}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <div className="max-w-[160px] break-all">
                          {Array.isArray(task.tags) && task.tags.length > 0 ? task.tags.join(", ") : getFieldValue(task.description, "Evidence")}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <div className="max-w-[200px] break-words whitespace-pre-line">
                          {getFieldValue(task.description, "Remarks")}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 align-top text-slate-700">
                        <form action={deleteTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <TaskActionButton variant="secondary" size="sm" pendingLabel="Deleting...">
                            Delete
                          </TaskActionButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
