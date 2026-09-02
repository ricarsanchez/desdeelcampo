import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionValue,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar sesión." },
      { status: 400 },
    );
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar sesión." },
      { status: 503 },
    );
  }

  const password =
    body &&
    typeof body === "object" &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta." }, { status: 401 });
  }

  const sessionValue = createAdminSessionValue();
  if (!sessionValue) {
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar sesión." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    sameSite: "lax",
  });

  return response;
}
