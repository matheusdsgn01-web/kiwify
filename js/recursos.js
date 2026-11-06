/**
 * Seção 7 — trilho horizontal guiado pelo scroll vertical.
 * Desktop (>1024px, com animações): a seção fica presa e o trilho anda para o lado
 * até o último card encostar na margem direita; a barra de progresso acompanha.
 * Mobile / movimento reduzido: carrossel nativo; a barra segue o scroll lateral.
 */
(() => {
  const section = document.querySelector(".recursos");
  if (!section) return;

  const viewport = section.querySelector(".recursos__viewport");
  const track = section.querySelector(".recursos__trilho");
  const progress = section.querySelector(".recursos__progress");

  const forceAnim = new URLSearchParams(location.search).has("anim");
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMq = window.matchMedia("(min-width: 1025px)");
  const clamp = (v) => Math.min(1, Math.max(0, v));

  let pinned = false;
  let ticking = false;

  function layout() {
    pinned = desktopMq.matches && (!reducedMq.matches || forceAnim);
    section.classList.toggle("is-pinned", pinned);

    if (pinned) {
      // O trilho anda até o fim dele alinhar com o fim da barra de progresso
      const travel = Math.max(0, track.scrollWidth - progress.getBoundingClientRect().width);
      section.style.setProperty("--travel", travel + "px");
    } else {
      section.style.setProperty("--travel", "0px");
    }
    update();
  }

  function update() {
    ticking = false;
    let p;
    if (pinned) {
      const rect = section.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      p = run > 0 ? clamp(-rect.top / run) : 0;
    } else {
      const max = viewport.scrollWidth - viewport.clientWidth;
      p = max > 0 ? clamp(viewport.scrollLeft / max) : 0;
    }
    section.style.setProperty("--p", p.toFixed(4));
  }

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", request, { passive: true });
  viewport.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", layout);
  desktopMq.addEventListener("change", layout);
  if (document.fonts) document.fonts.ready.then(layout);
  layout();
})();
