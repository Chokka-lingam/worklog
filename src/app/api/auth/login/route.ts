import { NextResponse } from "next/server";

import { ensureUserAccountData } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Unable to sign in." }, { status: 401 });
    }

    try {
      await ensureUserAccountData(
        supabase,
        data.user.id,
        data.user.email ?? email,
        data.user.user_metadata?.full_name ?? email.split("@")[0] ?? "User",
      );
    } catch (accountError) {
      const message = accountError instanceof Error ? accountError.message : "Unable to initialize your account.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: data.user.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
