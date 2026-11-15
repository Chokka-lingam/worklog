import { NextResponse } from "next/server";

import { ensureUserAccountData } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password and full name are required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id ?? data.session?.user.id;

    if (userId) {
      try {
        await ensureUserAccountData(supabase, userId, email, fullName);
      } catch (accountError) {
        const message = accountError instanceof Error ? accountError.message : "Unable to initialize your account.";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    return NextResponse.json(
      {
        success: true,
        userId,
        requiresEmailConfirmation: !!data.user && !data.session,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
