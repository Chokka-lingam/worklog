import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const title = String(data.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Please sign in to create a task." }, { status: 401 });
    }

    const description = String(data.description ?? "").trim();
    const assignedTo = String(data.assignedTo ?? "").trim();
    const dueDate = String(data.dueDate ?? "").trim();
    const taskDate = String(data.taskDate ?? "").trim();
    const startTime = String(data.startTime ?? "").trim();
    const completionTime = String(data.completionTime ?? "").trim();
    const workDone = String(data.workDone ?? "").trim();
    const evidenceLink = String(data.evidenceLink ?? "").trim();
    const remarks = String(data.remarks ?? "").trim();
    const priority = String(data.priority ?? "medium");
    const status = String(data.status ?? "not_started");

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? `${user.id}@local.user`,
        full_name: user.user_metadata?.full_name ?? (user.email ?? "User").split("@")[0] ?? "User",
        timezone: "Asia/Kolkata",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const detailParts = [
      description,
      assignedTo ? `Assigned to: ${assignedTo}` : "",
      startTime ? `Start time: ${startTime}` : "",
      completionTime ? `Completion time: ${completionTime}` : "",
      evidenceLink ? `Evidence: ${evidenceLink}` : "",
      remarks ? `Remarks: ${remarks}` : "",
      workDone ? `What I did: ${workDone}` : "",
    ].filter(Boolean);

    const detailedDescription = detailParts.join("\n\n");

    let { data: memberships, error: membershipsError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    let workspaceId = memberships?.[0]?.workspace_id ?? null;

    if (membershipsError) {
      return NextResponse.json({ error: membershipsError.message }, { status: 500 });
    }

    if (!workspaceId) {
      const { data: fallbackWorkspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          owner_user_id: user.id,
          name: "My Workspace",
          description: "Default personal workspace",
          is_personal: true,
        })
        .select("id")
        .single();

      if (workspaceError || !fallbackWorkspace) {
        return NextResponse.json(
          { error: workspaceError?.message ?? "No workspace found for this account." },
          { status: 500 },
        );
      }

      workspaceId = fallbackWorkspace.id;

      const { error: membershipError } = await supabase.from("workspace_members").upsert(
        {
          workspace_id: workspaceId,
          user_id: user.id,
          role: "owner",
          status: "active",
        },
        { onConflict: "workspace_id,user_id" },
      );

      if (membershipError) {
        return NextResponse.json({ error: membershipError.message }, { status: 500 });
      }
    }

    const { error } = await supabase.from("tasks").insert({
      workspace_id: workspaceId,
      title,
      description: detailedDescription || null,
      priority,
      status,
      start_date: taskDate || null,
      due_date: dueDate || null,
      notes: [workDone, evidenceLink ? `Evidence: ${evidenceLink}` : "", remarks].filter(Boolean).join("\n\n") || null,
      tags: evidenceLink ? ["evidence"] : [],
      created_by: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Task creation failed:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
