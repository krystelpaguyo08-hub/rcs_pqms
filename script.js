document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('certificateLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeButton = document.getElementById('lightboxClose');
  const printButton = document.getElementById('lightboxPrint');
  const saveLink = document.getElementById('lightboxSave');
  const openOriginalButton = document.getElementById('lightboxOpenOriginal');
  let currentImageUrl = '';
  let previousFocus = null;

  if (!lightbox || !lightboxImage || !closeButton || !printButton || !saveLink || !openOriginalButton) {
    console.error('Image viewer elements are missing from index.html.');
    return;
  }

  function resolveImageUrl(path) {
    try { return new URL(path, document.baseURI).href; }
    catch (_) { return path; }
  }

  function openViewer(path, title, focusElement) {
    if (!path) return;
    currentImageUrl = resolveImageUrl(path);
    previousFocus = focusElement || document.activeElement;
    lightboxImage.src = currentImageUrl;
    lightboxImage.alt = title || 'Preview image';
    if (lightboxCaption) lightboxCaption.textContent = title || '';
    saveLink.href = currentImageUrl;
    saveLink.setAttribute('download', (title || 'portfolio-image').trim().replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() + (currentImageUrl.match(/\.(png|jpe?g|webp|gif)(?:[?#]|$)/i)?.[0]?.split(/[?#]/)[0] || '.png'));
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('image-viewer-open');
    closeButton.focus();
  }

  function closeViewer() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('image-viewer-open');
    lightboxImage.removeAttribute('src');
    currentImageUrl = '';
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  // Certificate buttons use their explicit data-full path. Project images are also clickable.
  document.addEventListener('click', (event) => {
    const certificateButton = event.target.closest('.certificate-open');
    if (certificateButton) {
      event.preventDefault();
      const image = certificateButton.querySelector('img');
      openViewer(certificateButton.dataset.full || image?.getAttribute('src'), certificateButton.dataset.title || image?.alt, certificateButton);
      return;
    }

    const projectLink = event.target.closest('.project-image-card');
    if (projectLink) {
      event.preventDefault();
      const image = projectLink.querySelector('img');
      if (image) openViewer(image.getAttribute('src'), image.alt, projectLink);
    }
  });

  closeButton.addEventListener('click', closeViewer);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeViewer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeViewer();
  });

  printButton.addEventListener('click', () => {
    if (!currentImageUrl) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      alert('The print window was blocked. Allow pop-ups for this site, then try Print again.');
      return;
    }
    printWindow.document.write(`<!doctype html><html><head><title>Print image</title><style>html,body{margin:0;padding:0;background:#fff}body{display:flex;align-items:center;justify-content:center;min-height:100vh}img{display:block;max-width:100%;max-height:100vh;object-fit:contain}@page{margin:10mm}</style></head><body><img id="printImage" src="${currentImageUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" alt=""></body></html>`);
    printWindow.document.close();
    const image = printWindow.document.getElementById('printImage');
    image.addEventListener('load', () => { printWindow.focus(); printWindow.print(); }, { once: true });
    image.addEventListener('error', () => { printWindow.close(); alert('Could not load this image for printing. Check the image path.'); }, { once: true });
  });

  openOriginalButton.addEventListener('click', () => {
    if (currentImageUrl) window.open(currentImageUrl, '_blank', 'noopener,noreferrer');
  });

  // Small existing page helpers, safe if their elements are present.
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }));
  }
});
