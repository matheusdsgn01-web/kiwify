/**
 * Menu fixo — troca o tema (claro/escuro) conforme a cor da seção que está
 * passando por baixo dele.
 *  - Seções: data-nav="light" (fundo claro → texto escuro) ou "dark".
 *  - Transições com scroll: data-nav-from / data-nav-stage / data-nav-end, lidos
 *    junto com o progresso que js/transicao.js grava (--stage e --fade).
 */
(() => {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const zones = [...document.querySelectorAll("[data-nav], [data-nav-stage]")];
  const PROBE = 36; // meio da barra (72px)
  let current = null;
  let ticking = false;

  const themeOf = (el) => {
    if (el.dataset.nav) return el.dataset.nav;
    // Transição: antes do palco aparecer = cor anterior; depois do fade = cor seguinte
    if (el.classList.contains("transicao--static")) return el.dataset.navStage;
    const stage = parseFloat(el.style.getPropertyValue("--stage")) || 0;
    const fade = parseFloat(el.style.getPropertyValue("--fade")) || 0;
    if (fade > 0.5) return el.dataset.navEnd;
    if (stage > 0.5) return el.dataset.navStage;
    return el.dataset.navFrom;
  };

  const update = () => {
    ticking = false;
    const zone = zones.find((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= PROBE && r.bottom > PROBE;
    });
    const theme = zone ? themeOf(zone) : "dark";
    if (theme !== current) {
      current = theme;
      nav.classList.toggle("nav--light", theme === "light");
    }
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
