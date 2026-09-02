import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "desde-el-campo-admin";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const SESSION_VERSION = "v1";
const MIN_SESSION_SECRET_LENGTH = 32;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= MIN_SESSION_SECRET_LENGTH ? secret : null;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function signSessionPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionSecret());
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();
  return configuredPassword ? safeEqual(password, configuredPassword) : false;
}

export function createAdminSessionValue(now = Date.now()) {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const expiresAt = now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${SESSION_VERSION}.${expiresAt}`;
  const signature = signSessionPayload(payload, secret);
  return `${payload}.${signature}`;
}

export function isAdminCookie(value: string | undefined, now = Date.now()) {
  const secret = getAdminSessionSecret();
  if (!secret || !value) return false;

  const [version, expiresAtRaw, signature, ...extra] = value.split(".");
  if (version !== SESSION_VERSION || !expiresAtRaw || !signature || extra.length > 0) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  const payload = `${version}.${expiresAtRaw}`;
  const expectedSignature = signSessionPayload(payload, secret);
  return safeEqual(signature, expectedSignature);
}

export function requireAdminRequest(request: NextRequest) {
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (isAdminCookie(value)) return null;

  return NextResponse.json(
    { ok: false, error: "No autorizado" },
    { status: 401 },
  );
}

export function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || secret.length < 16 || !authorization) return false;
  return safeEqual(authorization, `Bearer ${secret}`);
}
