/**
 * Seção 11 — "Sua operação no bolso"
 *  - Notificações "Venda aprovada!" entram uma a uma quando a lista aparece.
 *  - Parallax leve no celular (desktop), acompanhando o scroll.
 */
(() => {
  const section = document.querySelector(".app");
  if (!section) return;

  const forceAnim = new URLSearchParams(location.search).has("anim");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim;
  if (reduced) return;

  // Notificações em sequência
  const list = section.querySelector(".app__notifs");
  if (list && "IntersectionObserver" in window) {
    section.classList.add("js-anim");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          list.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(list);
  }

  // Parallax do celular (só quando ele está posicionado ao lado do texto)
  const phone = section.querySelector(".app__celular");
  const desktop = window.matchMedia("(min-width: 1025px)");
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!desktop.matches) {
      phone.style.removeProperty("--parallax");
      return;
    }
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return;
    // -1 (seção entrando por baixo) → 1 (saindo por cima)
    const t = (vh / 2 - (rect.top + rect.height / 2)) / ((vh + rect.height) / 2);
    phone.style.setProperty("--parallax", (-t * 40).toFixed(2) + "px");
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
