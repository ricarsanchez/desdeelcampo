const FALLBACK_REDIRECT = "/admin";
const INTERNAL_ORIGIN = "https://internal.invalid";

export function sanitizeRedirectTo(value: string | null | undefined): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    Array.from(value).some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)
  ) {
    return FALLBACK_REDIRECT;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    // Dot segments can normalize an otherwise internal path to a leading //.
    if (url.origin !== INTERNAL_ORIGIN || url.pathname.startsWith("//")) {
      return FALLBACK_REDIRECT;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return FALLBACK_REDIRECT;
  }
}
