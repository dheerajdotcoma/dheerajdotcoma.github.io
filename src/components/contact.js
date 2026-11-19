/** Copy-to-clipboard for the contact email (the button only appears when JS + clipboard exist). */
export function initContact() {
  const btn = document.querySelector('.btn-copy');
  if (!btn || !navigator.clipboard) return;
  const status = btn.parentElement.querySelector('.copy-status');
  const label = btn.querySelector('.btn-copy-label');
  let t;
  btn.hidden = false;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = 'Copied';
      status.textContent = 'Email address copied to clipboard';
    } catch {
      status.textContent = 'Copy failed. Select the address above instead.';
    }
    clearTimeout(t);
    t = setTimeout(() => { label.textContent = 'Copy email'; status.textContent = ''; }, 2400);
  });
}
