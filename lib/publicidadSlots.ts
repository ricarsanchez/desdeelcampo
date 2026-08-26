export const PUBLICIDAD_SLOT_OPTIONS = [
  { value: "sidebar_top", label: "Lateral superior" },
  { value: "sidebar_middle", label: "Lateral medio" },
  { value: "sidebar_bottom", label: "Lateral inferior" },
  { value: "main_banner", label: "Banner central" },
] as const;

export type PublicidadSlot = (typeof PUBLICIDAD_SLOT_OPTIONS)[number]["value"];
export type PublicidadSlotInput = PublicidadSlot | "sidebar";

export const DEFAULT_PUBLICIDAD_SLOT: PublicidadSlot = "sidebar_top";

export function isPublicidadSlot(value: unknown): value is PublicidadSlot {
  return PUBLICIDAD_SLOT_OPTIONS.some((option) => option.value === value);
}

export function isPublicidadSlotInput(value: unknown): value is PublicidadSlotInput {
  return value === "sidebar" || isPublicidadSlot(value);
}

export function normalizePublicidadSlot(value: unknown): PublicidadSlot {
  if (value === "sidebar") return "sidebar_top";
  if (isPublicidadSlot(value)) return value;
  return DEFAULT_PUBLICIDAD_SLOT;
}

export function getPublicidadSlotLabel(value: unknown): string {
  const normalized = normalizePublicidadSlot(value);
  return (
    PUBLICIDAD_SLOT_OPTIONS.find((option) => option.value === normalized)?.label ??
    "Lateral superior"
  );
}
