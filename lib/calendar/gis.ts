// lib/calendar/gis.ts
// Google Identity Services — the token half only. No client secret, no
// server, no refresh token. The access token lives here in a module
// variable and is never persisted (see docs/CALENDAR.md).

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const isCalendarConfigured = GOOGLE_CLIENT_ID.length > 0;

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

/** Inject the GIS script once; resolve when `window.google` is ready. */
function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`
    );
    const script = existing ?? document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Google Identity Services failed to load"));
    };
    if (!existing) document.head.appendChild(script);
  });
  return scriptPromise;
}

let client: TokenClient | null = null;
let pending: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
} | null = null;

let accessToken: string | null = null;
let expiresAt = 0;
let inflight: Promise<string> | null = null;

async function getClient(): Promise<TokenClient> {
  await loadGis();
  const oauth2 = window.google?.accounts.oauth2;
  if (!oauth2) throw new Error("Google Identity Services unavailable");
  if (!client) {
    client = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        const settle = pending;
        pending = null;
        if (!settle) return;
        if (response.access_token) {
          accessToken = response.access_token;
          expiresAt = Date.now() + (response.expires_in ?? 3600) * 1000;
          settle.resolve(accessToken);
        } else {
          settle.reject(new Error(response.error ?? "Authorisation failed"));
        }
      },
      error_callback: (error) => {
        const settle = pending;
        pending = null;
        settle?.reject(new Error(error.type ?? "Authorisation was dismissed"));
      },
    });
  }
  return client;
}

/**
 * A valid access token. Returns the cached one until it's within 60s of
 * expiry, then asks GIS for a new one.
 *
 * `interactive` must be true only when there's a real user gesture behind the
 * call (the Connect button, Sync now). Everything else — the sync on open,
 * the calendar list refresh — passes false, which uses `prompt: "none"`: GIS
 * renews silently through a hidden iframe if the Google session is alive, and
 * rejects (no UI) if it isn't. That's the difference between "auth once" and
 * a popup on every refresh.
 */
export async function getAccessToken(interactive = false): Promise<string> {
  if (!isCalendarConfigured) throw new Error("Calendar is not configured");
  if (accessToken && expiresAt - 60_000 > Date.now()) return accessToken;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const tokenClient = await getClient();
      return await new Promise<string>((resolve, reject) => {
        pending = { resolve, reject };
        tokenClient.requestAccessToken({ prompt: interactive ? "" : "none" });
      });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Drop the local token and tell Google to forget the grant. */
export function revokeAccess(): void {
  const token = accessToken;
  accessToken = null;
  expiresAt = 0;
  if (token && window.google?.accounts.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
}
