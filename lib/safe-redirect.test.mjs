import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeRedirectTo } from "./safe-redirect.ts";

for (const path of ["/admin", "/admin?tab=instagram", "/", "/admin#section", "/admin?next=https%3A%2F%2Fexample.com"]) {
  test(`preserves internal path ${path}`, () => {
    assert.equal(sanitizeRedirectTo(path), path);
  });
}

for (const value of [
  null, undefined, "", " ", "admin", "https://evil.com", "http://evil.com",
  "https://example.com", "//evil.com", "///evil.com", "javascript:alert(1)",
  "data:text/html,...", "/\\evil.com", "\\evil.com", "/\n/evil.com",
  "/\t/evil.com", "/\r/evil.com", "/\u0000/evil.com", "/\u007f/evil.com",
  "/ /evil.com", "/..//evil.com", "/%2e%2e//evil.com", " https://evil.com",
]) {
  test(`falls back for ${JSON.stringify(value)}`, () => {
    assert.equal(sanitizeRedirectTo(value), "/admin");
  });
}

test("validates values decoded from the login query string", () => {
  for (const query of [
    "redirectTo=https%3A%2F%2Fexample.com",
    "redirectTo=javascript%3Aalert(1)",
    "redirectTo=%2F%2Fevil.com",
    "redirectTo=%2F%5Cevil.com",
  ]) {
    assert.equal(sanitizeRedirectTo(new URLSearchParams(query).get("redirectTo")), "/admin");
  }
});
