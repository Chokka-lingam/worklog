import { appConfig, isLocalEnvironment } from "@/lib/config";

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value && isLocalEnvironment && name.startsWith("NEXT_PUBLIC_")) {
    if (name === "NEXT_PUBLIC_SUPABASE_URL") {
      return appConfig.supabaseUrl || "http://127.0.0.1:54321";
    }

    if (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      return appConfig.supabaseAnonKey || "local-dev-anon-key";
    }

    if (name === "NEXT_PUBLIC_APP_URL") {
      return appConfig.appUrl;
    }
  }

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}
