import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type SavedUpload = {
  filename: string;
  url: string; // public url (served from /public)
  absolutePath: string;
  bytes: number;
  contentType?: string;
};

function safeBaseName(input: string) {
  const base = path.basename(input).replace(/\s+/g, "-");
  return base.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) || "archivo";
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function uploadsDirAbsolute() {
  return path.join(process.cwd(), "public", "uploads");
}

export async function ensureUploadsDir() {
  await mkdir(uploadsDirAbsolute(), { recursive: true });
}

export async function saveFormDataFileToPublicUploads(file: File, prefix: string) {
  await ensureUploadsDir();

  const original = safeBaseName(file.name || "archivo");
  const ext = path.extname(original);
  const base = path.basename(original, ext);
  const filename = `${prefix}-${base}-${uid()}${ext || ""}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const absolutePath = path.join(uploadsDirAbsolute(), filename);
  await writeFile(absolutePath, buffer);

  const url = `/uploads/${filename}`;
  return {
    filename,
    url,
    absolutePath,
    bytes: buffer.byteLength,
    contentType: file.type || undefined,
  } satisfies SavedUpload;
}

