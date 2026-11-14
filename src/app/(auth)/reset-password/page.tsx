"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updatePassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

    if (!password || !confirmPassword) {
      setErrorMessage("Both password fields are required.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error ?? "Unable to update password.");
        return;
      }

      router.push("/login?success=" + encodeURIComponent("Password updated successfully. Please sign in."));
    } catch {
      setErrorMessage("Unable to update password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-4 text-center sm:mb-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
          Create a new password
        </p>
        <h2 className="mt-2 text-[2.4rem] font-black leading-[0.95] tracking-[-0.08em] text-slate-900 sm:text-[3.2rem]">
          Reset password
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f2f2f2] px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            placeholder="New password"
          />
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f2f2f2] px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            placeholder="Confirm password"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#2d7ff9] px-4 py-3 text-[1.05rem] font-semibold text-white shadow-sm transition hover:bg-[#246ee8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </form>

      <p className="mt-4 text-center text-base text-slate-600 sm:mt-5">
        Back to{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
