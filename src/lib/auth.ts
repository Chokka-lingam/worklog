"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function fullNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "User";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function ensureUserAccountData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  email: string,
  fullName: string,
) {
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      timezone: "Asia/Kolkata",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: existingWorkspace, error: workspaceLookupError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (workspaceLookupError) {
    throw new Error(workspaceLookupError.message);
  }

  let workspace = existingWorkspace;

  if (!workspace) {
    const { data: createdWorkspace, error: workspaceInsertError } = await supabase
      .from("workspaces")
      .insert({
        owner_user_id: userId,
        name: `${fullName.trim() || "My"}'s Workspace`,
        description: "Default personal workspace",
        is_personal: true,
      })
      .select("id")
      .single();

    if (workspaceInsertError) {
      throw new Error(workspaceInsertError.message);
    }

    workspace = createdWorkspace;
  }

  if (!workspace) {
    throw new Error("Workspace could not be created for this user.");
  }

  const { error: membershipError } = await supabase.from("workspace_members").upsert(
    {
      workspace_id: workspace.id,
      user_id: userId,
      role: "owner",
      status: "active",
    },
    { onConflict: "workspace_id,user_id" },
  );

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { error: preferencesError } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      time_zone: "Asia/Kolkata",
      daily_productive_target_minutes: 480,
      theme: "system",
    },
    { onConflict: "user_id" },
  );

  if (preferencesError) {
    throw new Error(preferencesError.message);
  }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Missing credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const user = signInData.user;
  if (user) {
    const resolvedEmail = user.email ?? email;
    const resolvedName = user.user_metadata?.full_name ?? fullNameFromEmail(resolvedEmail);

    try {
      await ensureUserAccountData(supabase, user.id, resolvedEmail, resolvedName);
    } catch (accountError) {
      const message = accountError instanceof Error ? accountError.message : "Unable to create your workspace.";
      redirect(`/login?error=${encodeURIComponent(message)}`);
    }
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password || !fullName) {
    redirect("/register?error=Please complete all fields");
  }

  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (signUpError) {
    redirect(`/register?error=${encodeURIComponent(signUpError.message)}`);
  }

  const userId = authData.user?.id ?? authData.session?.user.id;

  if (!userId) {
    redirect("/register?error=Account created, but user data is unavailable. Please sign in again.");
  }

  try {
    await ensureUserAccountData(supabase, userId, email, fullName);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create your workspace.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  redirect("/login?success=Account created successfully. Please check your email and sign in.");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/forgot-password?error=Email is required");
  }

  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?type=recovery`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?success=Password reset email sent");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!password || !confirmPassword) {
    redirect("/reset-password?error=Both password fields are required");
  }

  if (password.length < 8) {
    redirect("/reset-password?error=Password must be at least 8 characters long");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords do not match");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=Password updated successfully. Please sign in.");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
