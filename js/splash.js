// Splash de apertura: una imagen de pantalla completa (portrait o landscape
// según la orientación real del dispositivo, ver la media query en
// style.css) que se saca al tocar o sola después de unos segundos.
(function () {
  function dismiss() {
    const el = document.getElementById('splashOverlay');
    if (!el || el.classList.contains('hidden')) return;
    el.classList.add('hidden');
    if (window.AUDIO) AUDIO.ensureCtx();
  }

  function init() {
    const el = document.getElementById('splashOverlay');
    if (!el) return;
    el.addEventListener('pointerdown', dismiss);
    setTimeout(dismiss, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
