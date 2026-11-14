export const isLocalEnvironment =
  process.env.APP_ENV === "local" || process.env.NODE_ENV !== "production";

export const appConfig = {
  env: process.env.APP_ENV ?? (isLocalEnvironment ? "local" : "production"),
  isLocal: isLocalEnvironment,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};
