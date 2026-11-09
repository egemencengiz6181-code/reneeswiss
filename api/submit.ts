/**
 * Form endpoint. No database: validates, then forwards.
 *
 * Environment variables (Vercel → Settings → Environment Variables, or the Cloudflare Pages equivalent):
 *   TURNSTILE_SECRET   Turnstile secret key. Enforced when set.
 *   FORWARD_URL        Formspree form URL or any webhook that receives the submission as JSON.
 *   BREVO_API_KEY      Optional. Adds contacts who ticked the newsletter box.
 *   BREVO_LIST_AGENCY, BREVO_LIST_SME, BREVO_LIST_KI   Brevo list IDs per audience.
 */
interface Env {
  TURNSTILE_SECRET?: string;
  FORWARD_URL?: string;
  BREVO_API_KEY?: string;
  BREVO_LIST_AGENCY?: string;
  BREVO_LIST_SME?: string;
  BREVO_LIST_KI?: string;
}

const NEXT_OK = /^\/(de|en|fr|tr)\/[a-z0-9/-]+\/$/;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMS: Record<string, { audience: 'agency' | 'sme' | 'ki-check'; list: keyof Env }> = {
  agency: { audience: 'agency', list: 'BREVO_LIST_AGENCY' },
  contact: { audience: 'sme', list: 'BREVO_LIST_SME' },
  'ki-check': { audience: 'ki-check', list: 'BREVO_LIST_KI' },
};
const MAX_FIELD = 5000;

const fail = (status: number, message: string) =>
  new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

const clientIp = (request: Request) =>
  request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export const handle = async ({ request, env, waitUntil }: { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void }) => {
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? '').trim();
  const url = new URL(request.url);

  const next = get('_next');
  if (!NEXT_OK.test(next)) return fail(400, 'Invalid form.');
  const thanks = new URL(next, url.origin).toString();

  // Honeypot filled → pretend success, drop silently.
  if (get('fax_number')) return Response.redirect(thanks, 303);

  const type = FORMS[get('form')];
  if (!type) return fail(400, 'Invalid form.');
  const email = get('email');
  if (!EMAIL_OK.test(email)) return fail(400, 'Invalid email address.');

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, get('cf-turnstile-response'), clientIp(request));
    if (!ok) return fail(403, 'Spam protection failed. Please reload the page and try again.');
  }

  const data: Record<string, string> = {};
  for (const key of new Set(form.keys())) {
    if (key === 'cf-turnstile-response' || key === 'fax_number' || key === '_next') continue;
    data[key] = form.getAll(key).map((v) => String(v).slice(0, MAX_FIELD)).join(', ');
  }
  data.audience = type.audience;

  if (!env.FORWARD_URL) return fail(503, 'The message could not be delivered. Please write to us by email.');
  const forwarded = await fetch(env.FORWARD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...data, _replyto: email, _subject: `[Renee ${type.audience}] ${get('company') || get('name') || email}` }),
  });
  if (!forwarded.ok) return fail(502, 'The message could not be delivered. Please write to us by email.');

  // Marketing list only with the explicit, unticked-by-default opt-in.
  const listId = Number(env[type.list]);
  if (env.BREVO_API_KEY && listId && get('newsletter') === 'yes') {
    waitUntil(
      fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listIds: [listId], updateEnabled: true, attributes: { LOCALE: get('locale'), COMPANY: get('company') } }),
      }),
    );
  }

  return Response.redirect(thanks, 303);
};

// Vercel entry point. Optional Brevo calls finish before the response is returned.
export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return fail(405, 'Method not allowed.');
    const pending: Promise<unknown>[] = [];
    const response = await handle({ request, env: process.env as Env, waitUntil: (p) => void pending.push(p) });
    await Promise.allSettled(pending);
    return response;
  },
};
