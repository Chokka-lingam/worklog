import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f3f5f7] px-4 pb-10 pt-[17vh] sm:px-6 sm:pt-[20vh]">
      <div className="w-full max-w-[520px] rounded-[18px] border border-slate-200 bg-[#f5f5f5] p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:p-5">
        {children}
      </div>
    </main>
  );
}
