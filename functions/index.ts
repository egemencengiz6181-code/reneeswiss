// Cloudflare Pages entry point for "/" (see public/_routes.json). The logic lives in middleware.ts.
import { redirect } from '../middleware';

export const onRequestGet = ({ request }: { request: Request }) => redirect(request);
