// src/types/api-results.ts
export type OTPSignInResult =
  | { ok: true }
  | {
      ok: false
      code:
        | 'INVALID_EMAIL'
        | 'INVALID_OTP'
        | 'OTP_EXPIRED'
        | 'RATE_LIMITED'
        | 'NOT_AUTHORIZED'
        | 'UNKNOWN'
    }

export type SwitchOrganizationResult =
  | { ok: true }
  | { ok: false; code: 'MISSING_ORG_ID' | 'NOT_FOUND_OR_NO_ACCESS' | 'UNKNOWN' }

export type TeamSwitchResult<T extends string = string> =
  | { ok: true }
  | { ok: false; code: T | 'INVALID_INPUT' | 'NOT_AUTHORIZED' | 'UNKNOWN' }

// src/types/result.ts
export type R<T = void> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message?: string }
