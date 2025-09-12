// src/types/result.ts
export type R<T = void> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message?: string }
