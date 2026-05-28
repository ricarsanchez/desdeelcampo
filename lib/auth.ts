export const ADMIN_COOKIE_NAME = "desde-el-campo-admin";
export const ADMIN_SESSION_VALUE = "1";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

export function verifyAdminPassword(password: string) {
  return password === ADMIN_PASSWORD;
}

export function isAdminCookie(value: string | undefined) {
  return value === ADMIN_SESSION_VALUE;
}
