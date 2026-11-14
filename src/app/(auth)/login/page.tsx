"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const [errorMessage, setErrorMessage] = useState(resolvedSearchParams?.error ?? "");
  const [successMessage, setSuccessMessage] = useState(resolvedSearchParams?.success ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error ?? "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-4 text-center sm:mb-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
          Please enter your details
        </p>
        <h2 className="mt-2 text-[2.4rem] font-black leading-[0.95] tracking-[-0.08em] text-slate-900 sm:text-[3.2rem]">
          Welcome back
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f2f2f2] px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            placeholder="Email address"
          />
        </div>

        <div>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f2f2f2] px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            placeholder="Password"
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-2 pt-1 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:text-base">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Remember me for 30 days
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 sm:text-base">
            Forgot password
          </Link>
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#2d7ff9] px-4 py-3 text-[1.05rem] font-semibold text-white shadow-sm transition hover:bg-[#246ee8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-base text-slate-600 sm:mt-5">
        Don’t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}
