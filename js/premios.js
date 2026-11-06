/**
 * Seção 4 — cards empilhando.
 * O card de R$5M é sticky; o de R$10M sobe e cobre. Enquanto isso, o 5M recebe
 * --cobre de 0 → 1 (o CSS usa para encolher e escurecer, dando profundidade).
 * Com "reduzir movimento" ativo (e sem ?anim), o empilhamento continua (é só rolagem),
 * mas sem o encolher/escurecer.
 */
(() => {
  const card5 = document.querySelector(".premio--5m");
  const card10 = document.querySelector(".premio--10m");
  if (!card5 || !card10) return;

  const forceAnim = new URLSearchParams(location.search).has("anim");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim) return;

  let ticking = false;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  const update = () => {
    ticking = false;
    const r5 = card5.getBoundingClientRect();
    const r10 = card10.getBoundingClientRect();
    // distância inicial entre os topos = altura do 5M (sem a escala) + espaço entre eles
    const gap = parseFloat(getComputedStyle(card5.parentElement).rowGap) || 0;
    const dist = card5.offsetHeight + gap;
    const q = clamp(1 - (r10.top - r5.top) / dist);
    card5.style.setProperty("--cobre", q.toFixed(4));
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();
