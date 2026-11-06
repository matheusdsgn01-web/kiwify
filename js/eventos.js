/**
 * Seção 6 — contador "+3.000" sobe de 0 até o valor final quando entra na tela.
 */
(() => {
  const el = document.querySelector(".eventos__numero span");
  if (!el) return;

  const final = el.textContent.trim(); // "+3.000"
  const target = parseInt(final.replace(/\D/g, ""), 10);
  const fmt = (n) => "+" + n.toLocaleString("pt-BR");

  // Trava a largura no valor final (evita o texto "pular" durante a contagem)
  const lock = () => {
    el.style.minWidth = "";
    el.style.minWidth = el.getBoundingClientRect().width + "px";
  };
  lock();
  window.addEventListener("resize", lock);

  const forceAnim = new URLSearchParams(location.search).has("anim");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim;
  if (reduced || !("IntersectionObserver" in window)) return;

  el.textContent = fmt(0);

  const run = () => {
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // desacelera no final
      el.textContent = t < 1 ? fmt(Math.round(target * eased)) : final;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        run();
        io.disconnect();
      }
    },
    { threshold: 0.5 }
  );
  io.observe(el);
})();
