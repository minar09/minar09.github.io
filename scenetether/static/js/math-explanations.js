(function () {
  'use strict';
  function initialize() {
    var formulas = document.querySelectorAll('[data-math-terms]');
    if (!formulas.length) return;
    var explanations = {
      equation: ['Read-time source-value tethering', 'At every attention read (n >= 7), SceneTether keeps all newest-frame keys K_r unchanged while interpolating low-activity values toward co-located source values V_0.'],
      tethered: ['Tethered read value V~_r(p)', 'Temporary value returned at token p when self-attention reads the newest generated latent z_{n-1}. Never written directly into persistent KV storage.'],
      recent: ['Recent generated value V_r(p)', 'Unmodified value vector from the newest committed latent z_{n-1} at spatial index p, carrying recent motion state.'],
      schedule: ['Activity-gated tether weight beta(p)', 'Frozen schedule from the 1.5 s warm-up map: beta = 0 on active mask M(p)=1, beta = 0.5 on the 1-token boundary band, and graded w(p) in (0, 1] in the static interior.'],
      source: ['Co-located source value V_0(p)', 'Clean value vector of the input photograph z_0 pinned at prefill (t = 0) at the exact same layer, head, and token index p.'],
      attn: ['Newest-frame attention weights A_r', 'Current block’s softmax attention columns addressing all T = 1560 unchanged keys K_r of the newest latent.'],
      shift: ['Attention output shift Delta O', 'Exact per-head pre-projection shift toward source-aligned appearance where activity is low, adding zero extra denoising evaluations.']
    };
    var tooltip = document.createElement('div');
    tooltip.id = 'math-help-tooltip';
    tooltip.className = 'math-help-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.hidden = true;
    var title = document.createElement('strong'), body = document.createElement('p');
    tooltip.append(title, body);
    document.body.appendChild(tooltip);
    var anchor = null, owner = null, timer;
    function hide() {
      clearTimeout(timer);
      if (anchor) anchor.classList.remove('is-explained');
      if (owner) owner.removeAttribute('aria-describedby');
      tooltip.hidden = true;
      anchor = owner = null;
    }
    function show(key, target, focusOwner) {
      var copy = explanations[key];
      if (!copy) return;
      clearTimeout(timer);
      if (anchor && anchor !== target) anchor.classList.remove('is-explained');
      if (owner && owner !== focusOwner) owner.removeAttribute('aria-describedby');
      anchor = target; owner = focusOwner;
      anchor.classList.add('is-explained');
      owner.setAttribute('aria-describedby', tooltip.id);
      title.textContent = copy[0]; body.textContent = copy[1];
      tooltip.hidden = false;
      var rect = anchor.getBoundingClientRect(), formulaRect = owner.getBoundingClientRect(), box = tooltip.getBoundingClientRect();
      var left = Math.max(8, Math.min(innerWidth - box.width - 8, rect.left + rect.width / 2 - box.width / 2));
      var top = formulaRect.bottom + 10;
      if (top + box.height > innerHeight - 8) top = formulaRect.top - box.height - 10;
      tooltip.style.left = left + 'px';
      tooltip.style.top = Math.max(8, top) + 'px';
    }
    function deferHide() { clearTimeout(timer); timer = setTimeout(hide, 150); }
    function termKey(term) {
      return ['tethered', 'recent', 'schedule', 'source', 'attn', 'shift'].find(function (key) { return term.classList.contains('term-' + key); });
    }
    formulas.forEach(function (formula) {
      var selected = -1;
      function termAt(event) {
        var term = event.target.closest('.math-term');
        if (term) return term;
        return Array.from(formula.querySelectorAll('.math-term')).find(function (candidate) {
          var rect = candidate.getBoundingClientRect();
          return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        });
      }
      function explainTerm(term) {
        var terms = Array.from(formula.querySelectorAll('.math-term'));
        selected = terms.indexOf(term);
        show(termKey(term), term, formula);
      }
      formula.addEventListener('pointermove', function (event) {
        var term = termAt(event);
        if (term) explainTerm(term);
        else if (event.target.closest('.katex')) show('equation', formula, formula);
      });
      formula.addEventListener('pointerleave', deferHide);
      formula.addEventListener('focus', function () { selected = -1; show('equation', formula, formula); });
      formula.addEventListener('blur', hide);
      formula.addEventListener('click', function (event) {
        var term = termAt(event);
        formula.focus({ preventScroll: true });
        if (term) explainTerm(term);
      });
      formula.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        var terms = Array.from(formula.querySelectorAll('.math-term'));
        if (!terms.length) return;
        event.preventDefault();
        selected = selected < 0 ? (event.key === 'ArrowRight' ? 0 : terms.length - 1) : (selected + (event.key === 'ArrowRight' ? 1 : -1) + terms.length) % terms.length;
        explainTerm(terms[selected]);
      });
    });
    tooltip.addEventListener('pointerenter', function () { clearTimeout(timer); });
    tooltip.addEventListener('pointerleave', deferHide);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); });
    document.addEventListener('pointerdown', function (event) {
      if (!tooltip.hidden && !tooltip.contains(event.target) && owner && !owner.contains(event.target)) hide();
    });
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
}());
