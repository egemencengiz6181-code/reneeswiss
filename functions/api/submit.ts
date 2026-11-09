// Cloudflare Pages entry point. The form logic lives in api/submit.ts.
import { handle } from '../../api/submit';

export const onRequestPost = handle;
