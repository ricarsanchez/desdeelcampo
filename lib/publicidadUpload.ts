export const MAX_PUBLICIDAD_FILE_BYTES = 4 * 1024 * 1024;

export const PUBLICIDAD_FILE_TOO_LARGE_ERROR =
  "El archivo es demasiado grande. Por ahora el máximo permitido es 4 MB. Para videos, comprimilo o usá uno más corto.";

export const PUBLICIDAD_UPLOAD_FALLBACK_ERROR =
  "No se pudo subir el archivo. Puede ser demasiado grande o la conexión falló.";

export async function readPublicidadUploadJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(PUBLICIDAD_UPLOAD_FALLBACK_ERROR);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(PUBLICIDAD_UPLOAD_FALLBACK_ERROR);
  }
}
