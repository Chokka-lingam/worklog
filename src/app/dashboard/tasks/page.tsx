import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        Please sign in to view tasks.
      </div>
    );
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  const workspaceIds = memberships?.map((member) => member.workspace_id) ?? [];

  let tasks: any[] = [];

  if (workspaceIds.length > 0) {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, description, status, priority, start_date, due_date, notes, created_at")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false });

    tasks = data ?? [];
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tasks</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Task list</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {tasks.length} total
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">#</th>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Date</th>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Task</th>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Priority</th>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Status</th>
                <th className="border-b border-slate-200 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr key={task.id} className="align-top">
                    <td className="border-b border-slate-200 px-3 py-3 text-slate-700">{index + 1}</td>
                    <td className="border-b border-slate-200 px-3 py-3 text-slate-700">
                      {task.start_date ?? task.created_at?.slice(0, 10) ?? "-"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3 font-medium text-slate-900">
                      {task.title ?? "Untitled task"}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        {task.priority ?? "medium"}
                      </span>
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-emerald-700">
                        {task.status ?? "not_started"}
                      </span>
                    </td>
                    <td className="border-b border-slate-200 px-3 py-3 text-slate-600">
                      {task.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
