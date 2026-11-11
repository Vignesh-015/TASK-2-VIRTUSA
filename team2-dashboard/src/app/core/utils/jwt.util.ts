/**
 * Minimal JWT helpers — no third-party library needed.
 * We only decode the payload (base64url), we do NOT verify the signature
 * on the client. Signature verification happens on the server.
 */

export interface JwtPayload {
  sub: string;    // email
  name: string;
  role: string;
  iat: number;    // issued-at (seconds)
  exp: number;    // expires-at (seconds)
}

/**
 * Decode the JWT payload section. Returns null if the token is malformed.
 * Deliberately does not throw so callers can handle null safely.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64 → JSON string
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    // malformed token — treat as if it doesn't exist
    return null;
  }
}

/** Returns true if the token is missing, unreadable, or its exp is in the past. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  // exp is in seconds; Date.now() is milliseconds
  return payload.exp * 1000 < Date.now();
}
