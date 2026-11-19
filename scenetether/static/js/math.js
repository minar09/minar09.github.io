(function () {
  'use strict';
  function render() {
    if (!window.katex) return;
    document.querySelectorAll('[data-latex]').forEach(function (node) {
      var annotated = node.dataset.mathTerms === 'true';
      window.katex.render(node.dataset.latex, node, {
        displayMode: true,
        throwOnError: true,
        strict: function (code) { return annotated && code === 'htmlExtension' ? 'ignore' : 'error'; },
        trust: function (context) {
          return annotated && context.command === '\\htmlClass' && /^math-term term-(tethered|recent|schedule|source|attn|shift)$/.test(context.class);
        },
        output: 'htmlAndMathml'
      });
      node.dataset.mathRendered = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();
