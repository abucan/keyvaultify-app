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
