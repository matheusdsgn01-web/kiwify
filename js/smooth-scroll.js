/**
 * Scroll suave na página toda (Lenis — https://github.com/darkroomengineering/lenis)
 * O Lenis continua usando o scroll nativo da janela, então as animações que
 * escutam "scroll" (ex.: js/transicao.js) seguem funcionando, só que suaves.
 */
(() => {
  if (typeof window.Lenis !== "function") return; // CDN indisponível → scroll nativo

  const forceAnim = new URLSearchParams(location.search).has("anim");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim) return;

  const lenis = new window.Lenis({
    lerp: 0.085, // quanto menor, mais "macio" (0.1 é o padrão)
    wheelMultiplier: 1,
    smoothWheel: true,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Links internos (#taxas, #duvidas…) também rolam suave
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -16 });
  });

  window.lenis = lenis;
})();
