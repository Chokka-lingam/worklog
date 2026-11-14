import Link from "next/link";

import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          WorkLog
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Reset password</h2>
      </div>

      <form action={requestPasswordReset} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 transition focus:border-slate-400"
            placeholder="you@example.com"
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-emerald-600">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Back to{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          sign in
        </Link>
      </p>
    </div>
  );
}
