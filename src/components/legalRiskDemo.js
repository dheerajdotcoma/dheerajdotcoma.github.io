/**
 * Legal Document Risk Assessor: sample-document demo.
 *
 * The contract excerpt is FICTIONAL (made-up parties "Acme Corp" and "Example Ltd") and the
 * analysis results are HARD-CODED for illustration. Edit everything in this one object.
 * TODO(owner): review the clause wording and the reasons.
 */
export const LEGAL_RISK_DEMO = {
  label: 'Sample document: illustrative only',
  documentTitle: 'Services Agreement (fictional excerpt)',
  clauses: [
    {
      heading: 'Parties',
      text: 'This Services Agreement is made between Acme Corp (“Provider”) and Example Ltd (“Client”).',
      risk: 'low',
      reason: 'Standard identification of the parties.',
    },
    {
      heading: 'Payment',
      text: 'Client shall pay each invoice within thirty (30) days of receipt.',
      risk: 'low',
      reason: 'Common, balanced payment term.',
    },
    {
      heading: 'Indemnity',
      text: 'Client shall indemnify and hold harmless Provider against any and all claims, without limitation, arising from use of the Services.',
      risk: 'high',
      reason: 'One-sided indemnity with no cap, placed entirely on the Client.',
    },
    {
      heading: 'Renewal',
      text: 'This Agreement renews automatically for successive twelve-month terms unless cancelled in writing ninety (90) days before the renewal date.',
      risk: 'medium',
      reason: 'A long notice window makes the cancellation deadline easy to miss.',
    },
    {
      heading: 'Termination',
      text: 'Provider may terminate this Agreement at any time, for any reason, without notice.',
      risk: 'high',
      reason: 'Lets one party walk away instantly, with no notice period and no matching right for the other side.',
    },
    {
      heading: 'Confidentiality',
      text: 'Each party shall keep the other party’s confidential information private for two (2) years after termination.',
      risk: 'low',
      reason: 'Mutual obligation with a defined duration.',
    },
    {
      heading: 'Disputes',
      text: 'Any dispute shall be resolved exclusively by arbitration at a venue chosen by Provider.',
      risk: 'medium',
      reason: 'The venue is chosen by one party alone.',
    },
  ],
  summary: {
    level: 'High',
    text: 'Two high-risk clauses (indemnity and termination) favour the Provider heavily. Review them before signing.',
  },
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RISK_LABEL = { high: 'High risk', medium: 'Medium risk', low: 'Low risk' };

export function render(data = LEGAL_RISK_DEMO, uid = 'lr') {
  const counts = data.clauses.reduce((a, c) => ((a[c.risk] = (a[c.risk] || 0) + 1), a), {});
  return `
<div class="demo demo-lr" data-demo="legalRisk" data-uid="${uid}">
  <p class="demo-label"><span class="demo-label-dot" aria-hidden="true"></span>${esc(data.label)}</p>
  <div class="lr-doc" role="region" aria-label="${esc(data.documentTitle)}" tabindex="0">
    <p class="lr-doc-title">${esc(data.documentTitle)}</p>
    <ol class="lr-clauses">
      ${data.clauses.map((c, i) => `<li class="lr-clause" data-risk="${c.risk}">
        <span class="lr-clause-body" id="${uid}-c${i}"><strong>${i + 1}. ${esc(c.heading)}.</strong> ${esc(c.text)}</span>
        <span class="lr-tag" aria-hidden="true">${RISK_LABEL[c.risk]}</span>
        <span class="lr-reason" id="${uid}-r${i}" role="note">${RISK_LABEL[c.risk]}: ${esc(c.reason)}</span>
      </li>`).join('\n      ')}
    </ol>
  </div>
  <div class="lr-actions">
    <button type="button" class="btn btn-primary lr-run">Run analysis</button>
    <span class="lr-hint">Hover or focus a highlighted clause to see why.</span>
  </div>
  <div class="lr-summary" data-level="${esc(data.summary.level.toLowerCase())}" hidden>
    <span class="pd-kicker">Overall risk</span>
    <p class="lr-summary-level">${esc(data.summary.level)}</p>
    <p class="lr-summary-counts">${counts.high || 0} high · ${counts.medium || 0} medium · ${counts.low || 0} low</p>
    <p class="lr-summary-text">${esc(data.summary.text)}</p>
  </div>
  <p class="visually-hidden" aria-live="polite" data-live></p>
  <noscript>
    <p class="demo-static">Analysis (the interactive version needs JavaScript): overall risk ${esc(data.summary.level)}. ${esc(data.summary.text)}</p>
  </noscript>
</div>`;
}

export function mount(root, data = LEGAL_RISK_DEMO) {
  const el = root.matches?.('[data-demo="legalRisk"]') ? root : root.querySelector('[data-demo="legalRisk"]');
  if (!el || el.dataset.mounted) return;
  el.dataset.mounted = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const btn = el.querySelector('.lr-run');
  const clauses = [...el.querySelectorAll('.lr-clause')];
  const summary = el.querySelector('.lr-summary');
  const live = el.querySelector('[data-live]');
  const hint = el.querySelector('.lr-hint');
  hint.hidden = true;

  btn.addEventListener('click', () => {
    const analysed = el.classList.contains('is-analysed');
    if (analysed) {
      // Reset so the analysis can be replayed.
      el.classList.remove('is-analysed');
      clauses.forEach((c) => { c.classList.remove('is-shown'); c.removeAttribute('tabindex'); c.removeAttribute('aria-describedby'); });
      summary.hidden = true;
      hint.hidden = true;
      btn.textContent = 'Run analysis';
      live.textContent = 'Analysis cleared.';
      return;
    }
    el.classList.add('is-analysed');
    btn.textContent = 'Reset';
    clauses.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add('is-shown');
        if (c.dataset.risk !== 'low') {
          c.tabIndex = 0;
          c.setAttribute('aria-describedby', c.querySelector('.lr-reason').id);
        }
      }, reduce ? 0 : i * 140);
    });
    setTimeout(() => {
      summary.hidden = false;
      hint.hidden = false;
      live.textContent = `Analysis complete. Overall risk ${data.summary.level}. ${data.summary.text}`;
    }, reduce ? 0 : clauses.length * 140 + 120);
  });
}
