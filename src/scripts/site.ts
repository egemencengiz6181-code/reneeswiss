// All client JS for the site. Kept small on purpose (performance budget: < 100 KB).
const root = document.documentElement;

// Sticky header CTA + mobile bottom bar appear once the visitor has scrolled.
const onScroll = () => root.classList.toggle('scrolled', window.scrollY > 480);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu: native <details>, plus Escape to close.
const menu = document.querySelector<HTMLDetailsElement>('details.menu');
// Only the active label ("Menu" or "Close") is exposed to screen readers and crawlers.
menu?.addEventListener('toggle', () => {
  menu.querySelectorAll<HTMLElement>('.menu-open, .menu-close').forEach((el) => {
    const hide = el.classList.contains('menu-open') === menu.open;
    el.hidden = hide;
    if (hide) el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  });
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.open) menu.open = false;
});

// Cal.com loads only after a click, so no third-party request happens on page view.
const dialog = document.querySelector<HTMLDialogElement>('dialog.cal');
if (dialog) {
  const frame = dialog.querySelector('iframe')!;
  document.querySelectorAll<HTMLAnchorElement>('a[data-cal]').forEach((a) =>
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      if (!frame.src) frame.src = a.href + (a.href.includes('?') ? '&' : '?') + 'embed=true';
      dialog.showModal();
    }),
  );
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
}

// Attribution: first-touch UTM values are kept for the tab session and sent with forms.
const UTM = ['utm_source', 'utm_medium', 'utm_campaign'];
const qs = new URLSearchParams(location.search);
const utm = (k: string) => {
  try {
    if (qs.get(k)) sessionStorage.setItem(k, qs.get(k)!);
    return sessionStorage.getItem(k) ?? '';
  } catch {
    return qs.get(k) ?? '';
  }
};

const forms = document.querySelectorAll<HTMLFormElement>('form[data-form]');
forms.forEach((f) => {
  UTM.forEach((k) => {
    const el = f.elements.namedItem(k) as HTMLInputElement | null;
    if (el) el.value = utm(k);
  });
});

// Turnstile is loaded on first interaction with a form.
const siteKey = document.body.dataset.turnstile;
if (siteKey && forms.length) {
  let requested = false;
  const load = () => {
    if (requested) return;
    requested = true;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=rnTurnstile&render=explicit';
    s.async = true;
    document.head.append(s);
  };
  (window as any).rnTurnstile = () =>
    forms.forEach((f) => {
      const box = f.querySelector<HTMLElement>('[data-turnstile-box]');
      if (box)
        (window as any).turnstile.render(box, {
          sitekey: siteKey,
          language: root.lang,
          callback: () => f.dataset.pending === '1' && f.requestSubmit(),
        });
    });
  forms.forEach((f) => {
    f.addEventListener('focusin', load, { once: true });
    f.addEventListener('submit', (e) => {
      const token = f.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
      if (!token?.value) {
        e.preventDefault();
        f.dataset.pending = '1';
        load();
      }
    });
  });
}
