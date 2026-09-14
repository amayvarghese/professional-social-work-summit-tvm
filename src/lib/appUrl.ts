/**
 * Public origin for share links. Prefers an explicit NEXT_PUBLIC_APP_URL, then
 * Vercel's own deployment host, then the incoming request — so previews and
 * production both produce working links with no configuration.
 */
export function appUrlFrom(request?: Request) {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}
