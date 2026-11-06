/**
 * Seção 5 — card "1 clique": moedas em carrossel.
 *
 * As 8 moedas do design foram recortadas em alta resolução (a partir do original
 * 1792×2400 exportado do Figma) em assets/img/posvenda/moedas/. No design elas já
 * formam um anel em perspectiva: atrás (em cima) pequenas, na frente (embaixo) grandes.
 * Aqui o anel gira devagar: cada moeda (estática, com o 3D da própria arte) segue a
 * outra pelo mesmo caminho, partindo da posição exata do design.
 *
 * Nitidez: cada moeda é desenhada no tamanho que tem NA FRENTE do carrossel e só
 * diminui (scale ≤ 1) quando vai para trás — nunca é ampliada.
 * Sem html.motion-ok fica a imagem estática original.
 */
(() => {
  const card = document.querySelector(".um-clique");
  if (!card || !document.documentElement.classList.contains("motion-ok")) return;
  const still = card.querySelector(".um-clique__moedas");
  if (!still) return;

  // Caixas de cada moeda no PNG de referência (765 × 1024 = tamanho do design)
  const SRC_W = 765;
  const COINS = [
    { n: "ethereum", x: 372, y: 195, w: 126, h: 129 },
    { n: "bitcoin", x: 231, y: 201, w: 129, h: 135 },
    { n: "solana", x: 504, y: 249, w: 129, h: 132 },
    { n: "bnb", x: 96, y: 270, w: 162, h: 174 },
    { n: "xrp", x: 573, y: 360, w: 156, h: 153 },
    { n: "cardano", x: 45, y: 432, w: 240, h: 249 },
    { n: "litecoin", x: 510, y: 519, w: 210, h: 204 },
    { n: "tether", x: 255, y: 600, w: 273, h: 249 },
  ];
  // Anel (ajustado aos centros das moedas no design)
  const RING = { cx: 413, cy: 492, rx: 240, ry: 232.5 };
  const SIZE_BACK = 126; // largura da moeda no fundo do anel
  const SIZE_FRONT = 273; // largura da moeda na frente do anel
  const ORBIT_SECONDS = 38; // uma volta completa — devagar, mas dá pra perceber

  const sizeAt = (theta) => SIZE_BACK + (SIZE_FRONT - SIZE_BACK) * ((1 + Math.cos(theta)) / 2);

  const stage = document.createElement("div");
  stage.className = "um-clique__moedas um-clique__moedas--3d";
  stage.setAttribute("aria-hidden", "true");

  COINS.forEach((c) => {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    c.theta0 = Math.atan2((cx - RING.cx) / RING.rx, (cy - RING.cy) / RING.ry);
    // fator para levar a moeda do tamanho do design ao tamanho "na frente"
    c.toFront = SIZE_FRONT / sizeAt(c.theta0);
    const img = document.createElement("img");
    img.className = "moeda";
    img.src = `assets/img/posvenda/moedas/${c.n}.png`;
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    stage.appendChild(img);
    c.el = img;
  });

  still.insertAdjacentElement("afterend", stage);
  card.classList.add("has-moedas-3d");

  let k = 1; // px do palco por px do PNG de referência
  const measure = () => {
    k = stage.clientWidth / SRC_W;
    COINS.forEach((c) => {
      c.fw = c.w * c.toFront * k; // tamanho desenhado (o da frente)
      c.fh = c.h * c.toFront * k;
      c.el.style.width = c.fw + "px";
      c.el.style.height = c.fh + "px";
    });
  };

  const render = (t) => {
    const delta = ((t / 1000) * 2 * Math.PI) / ORBIT_SECONDS;
    COINS.forEach((c) => {
      const th = c.theta0 + delta;
      const depth = (1 + Math.cos(th)) / 2; // 0 fundo → 1 frente
      const s = sizeAt(th) / SIZE_FRONT; // ≤ 1
      const x = (RING.cx + RING.rx * Math.sin(th)) * k - c.fw / 2;
      const y = (RING.cy + RING.ry * Math.cos(th)) * k - c.fh / 2;
      c.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      c.el.style.zIndex = String(Math.round(depth * 100));
      c.el.style.filter = `brightness(${(0.78 + 0.22 * depth).toFixed(3)})`;
    });
  };

  let raf = 0;
  let start = null;
  let elapsed = 0;
  const loop = (now) => {
    if (start === null) start = now - elapsed;
    elapsed = now - start;
    render(elapsed);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (!raf) {
      start = null;
      raf = requestAnimationFrame(loop);
    }
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  measure();
  render(0);
  window.addEventListener("resize", () => {
    measure();
    render(elapsed);
  });

  // Só anima quando o card está na tela
  new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? play() : pause()));
  }).observe(card);
})();
