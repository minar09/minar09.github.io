'use strict';

const relatedPapers = document.querySelector('.related-papers');

document.addEventListener('click', (event) => {
  if (relatedPapers.open && !relatedPapers.contains(event.target)) relatedPapers.open = false;
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && relatedPapers.open) {
    relatedPapers.open = false;
    if (relatedPapers.contains(document.activeElement)) relatedPapers.querySelector('summary').focus();
  }
});

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const select = gallery.querySelector('[data-gallery-select]');
  const panels = gallery.querySelectorAll('[data-gallery-panel]');
  const playButton = gallery.querySelector('[data-play-group]');

  function showScene() {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.galleryPanel !== select.value;
      if (panel.hidden) panel.querySelectorAll('video').forEach((video) => video.pause());
    });
    if (playButton) playButton.textContent = 'Play together';
  }

  select.closest('label').hidden = false;
  select.addEventListener('change', showScene);
  showScene();
});

document.querySelectorAll('[data-play-group]').forEach((button) => {
  const group = button.closest('.result-group, section');
  const videos = [...group.querySelectorAll('video')];

  const visibleVideos = () => videos.filter((video) => !video.closest('[hidden]'));
  const updateButton = () => {
    button.textContent = visibleVideos().some((video) => !video.paused) ? 'Pause together' : 'Play together';
  };

  button.hidden = false;
  button.addEventListener('click', () => {
    const active = visibleVideos();
    if (active.some((video) => !video.paused)) {
      active.forEach((video) => video.pause());
      return;
    }

    const unfinished = active.filter((video) => !video.ended);
    const clipsToPlay = unfinished.length ? unfinished : active;
    clipsToPlay.forEach((video) => video.play().catch(updateButton));
  });

  videos.forEach((video) => {
    ['play', 'pause', 'ended'].forEach((event) => video.addEventListener(event, updateButton));
  });
});

const copyButton = document.getElementById('copy-bibtex');
const citation = document.getElementById('bibtex-code');
const copyStatus = document.getElementById('copy-status');

if (navigator.clipboard) {
  let resetLabel;
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    clearTimeout(resetLabel);
    try {
      await navigator.clipboard.writeText(citation.textContent);
      copyButton.textContent = 'Copied';
      copyStatus.textContent = 'BibTeX copied to the clipboard.';
      resetLabel = setTimeout(() => { copyButton.textContent = 'Copy BibTeX'; }, 2000);
    } catch {
      copyButton.textContent = 'Copy BibTeX';
      copyStatus.textContent = 'Clipboard access failed. Use the Download link to save the citation.';
      const selection = document.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}
