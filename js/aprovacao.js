/**
 * Seção 3 — dial "+90% de aprovação"
 *  1. O arco grosso de 90% (assets/.../dial/c0a8d.svg) se desenha com o scroll:
 *     começa quando o topo do arco entra na tela e termina quando ele chega a ~1/3
 *     da altura da tela. A bolinha final (+ anéis e brilho) vai na ponta do traço.
 *  2. O número conta de 0 a 90 (rápido) quando aparece.
 *  3. Os chips de cartão flutuam (CSS: .aprovacao.is-floating).
 * Com "reduzir movimento" ativo (e sem ?anim), tudo fica no estado final.
 */
(() => {
  const section = document.querySelector(".aprovacao");
  if (!section) return;

  const forceAnim = new URLSearchParams(location.search).has("anim");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim) return;

  section.classList.add("is-floating");

  const dial = section.querySelector(".dial");
  const findDv = (file) => {
    const img = dial.querySelector(`img[src$="${file}.svg"]`);
    return img ? img.closest(".dv") : null;
  };

  // ---------- 2. Contagem 0 → 90 ----------
  const num = section.querySelector(".dial__num");
  if (num && "IntersectionObserver" in window) {
    const final = parseInt(num.textContent, 10) || 90;
    num.style.display = "inline-block";
    num.style.minWidth = num.getBoundingClientRect().width + "px"; // largura fixa durante a contagem
    num.textContent = "0";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1200;
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          num.textContent = String(Math.round(final * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(num);
  }

  // ---------- 1. Arco + bolinha guiados pelo scroll ----------
  const arcDv = findDv("c0a8d");
  const ballDvs = ["c55f1", "3f5de", "ce212", "a38ac"].map(findDv).filter(Boolean);
  if (!arcDv) return;
  const arcImg = arcDv.querySelector("img");

  fetch(arcImg.getAttribute("src"))
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((text) => {
      const svg = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
      if (svg.nodeName.toLowerCase() !== "svg") return;
      svg.removeAttribute("style");
      svg.setAttribute("class", "dial__arco");
      svg.setAttribute("aria-hidden", "true");
      // o SVG traz width/height próprios; aqui ele ocupa a caixa do <img> original
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";
      arcImg.replaceWith(document.importNode(svg, true));
      start();
    })
    .catch(() => {});

  function start() {
    const svg = arcDv.querySelector("svg");
    const path = svg.querySelector("path");
    const L = path.getTotalLength();
    const VB = svg.viewBox.baseVal.width;
    const end = path.getPointAtLength(L);
    path.style.strokeDasharray = `${L} ${L}`;

    let ticking = false;
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const ease = (t) => 1 - Math.pow(1 - t, 2);

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const r = svg.getBoundingClientRect();
      // início: topo do arco na base da tela → fim: topo do arco a 1/3 da tela
      const p = ease(clamp((vh - r.top) / (vh - vh / 3)));
      path.style.strokeDashoffset = String(L * (1 - p));

      // bolinha acompanha a ponta do traço (deslocamento em px do layout do dial)
      const pt = path.getPointAtLength(Math.max(0.001, L * p));
      const k = svg.clientWidth / VB;
      const dx = (pt.x - end.x) * k;
      const dy = (pt.y - end.y) * k;
      ballDvs.forEach((dv) => {
        dv.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        dv.style.opacity = p < 0.02 ? "0" : "1";
      });
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
  }
})();
