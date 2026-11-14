import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const JWT_COOKIE_NAME = "worklog_jwt";

export function getJwtSecret() {
  return process.env.APP_JWT_SECRET ?? "worklog-local-dev-secret-change-me";
}

export async function createAppJwt(payload: { sub: string; role?: string }) {
  const secret = new TextEncoder().encode(getJwtSecret());

  return await new SignJWT({
    sub: payload.sub,
    role: payload.role ?? "user",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAppJwt(token: string) {
  const secret = new TextEncoder().encode(getJwtSecret());
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function setAppJwtCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAppJwtCookie() {
  const cookieStore = await cookies();

  cookieStore.set(JWT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAppJwtCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE_NAME)?.value ?? null;
}

export async function getValidAppJwtPayload() {
  const token = await getAppJwtCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAppJwt(token);

    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      role: typeof payload.role === "string" ? payload.role : "user",
    };
  } catch {
    return null;
  }
}
