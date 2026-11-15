"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedPriorities = ["low", "medium", "high", "urgent"] as const;
const allowedStatuses = ["not_started", "in_progress", "paused", "completed", "cancelled"] as const;

function normalizePriority(value: string) {
  return allowedPriorities.includes(value as (typeof allowedPriorities)[number])
    ? (value as (typeof allowedPriorities)[number])
    : "medium";
}

function normalizeStatus(value: string) {
  return allowedStatuses.includes(value as (typeof allowedStatuses)[number])
    ? (value as (typeof allowedStatuses)[number])
    : "not_started";
}

export async function createTask(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const taskDate = String(formData.get("taskDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const completionTime = String(formData.get("completionTime") ?? "").trim();
  const workDone = String(formData.get("workDone") ?? "").trim();
  const evidenceLink = String(formData.get("evidenceLink") ?? "").trim();
  const remarks = String(formData.get("remarks") ?? "").trim();
  const priority = normalizePriority(String(formData.get("priority") ?? "medium"));
  const status = normalizeStatus(String(formData.get("status") ?? "not_started"));

  if (!title) {
    redirect("/dashboard?error=Task title is required");
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

  let workspaceId: string | null = memberships?.[0]?.workspace_id ?? null;

  if (membershipsError) {
    redirect(`/dashboard?error=${encodeURIComponent(membershipsError.message)}`);
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
      redirect(`/dashboard?error=${encodeURIComponent(workspaceError?.message ?? "No workspace found for this account")}`);
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
      redirect(`/dashboard?error=${encodeURIComponent(membershipError.message)}`);
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
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard");
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "").trim();
  const status = normalizeStatus(String(formData.get("status") ?? "not_started"));

  if (!taskId) {
    redirect("/dashboard?error=Task not found");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const taskId = String(formData.get("taskId") ?? "").trim();

  if (!taskId) {
    redirect("/dashboard?error=Task not found");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard");
}
