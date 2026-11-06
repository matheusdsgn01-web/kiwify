/**
 * Transições com scroll (todas as .transicao da página)
 *  - Transição 1: Sessão 4 → fundo verde + kiwi branco → zoom no branco → Sessão 5
 *  - Transição 2: FAQ → fundo branco + kiwi verde → zoom no verde → Sessão 10 (taxas)
 * As cores de cada uma ficam no CSS (css/transicao.css); a mecânica é a mesma.
 *
 * Linha do tempo:
 *  1. Entrada — a seção sobe na tela; o fundo e o logo pequeno aparecem suavemente.
 *  2. Palco fixo — já na primeira rolada a "câmera" mergulha no ponto mais grosso
 *     do anel do kiwi (zoom exponencial que acelera), até a cor do logo tomar a tela.
 *  3. Final — essa cor assenta na cor de fundo da próxima seção e a página segue.
 */
(() => {
  const sections = document.querySelectorAll(".transicao");
  if (!sections.length) return;

  // Respeita "reduzir movimento" do sistema (versão estática), exceto se a URL
  // tiver ?anim — útil para testar/apresentar com as animações do SO desligadas.
  const forceAnim = new URLSearchParams(location.search).has("anim");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim) {
    sections.forEach((s) => s.classList.add("transicao--static"));
    return;
  }

  // Geometria do vetor (unidades do viewBox do SVG exportado do Figma — igual nos dois kiwis)
  const VB = 1322.92;
  const CENTER = VB / 2;
  // Ponto no anel mais distante de qualquer borda (calculado por transformada de
  // distância sobre o vetor) e o raio livre ao redor dele.
  const FOCUS = { x: 509.6, y: 1171 };
  const FOCUS_R = 104.3;

  // Fases do progresso enquanto o palco está fixo (0 → 1).
  // O zoom começa já na primeira rolada e acelera; a cor cheia dura pouco.
  const ZOOM_END = 0.85; // fim do mergulho
  const ZOOM_EASE = 1.15; // >1 = acelera no final; perto de 1 = já cresce na 1ª rolada
  const FADE_START = 0.76; // cor do logo → cor da próxima seção
  const FADE_END = 0.92;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const updaters = [];

  sections.forEach((section) => {
    const stage = section.querySelector(".transicao__stage");
    let img = section.querySelector(".transicao__logo");
    let svg = null;

    // Troca o <img> por SVG inline (mesmo arquivo, sem alterações) para o zoom
    // ser vetorial. Se falhar (ex.: aberto via file://), segue com o <img>.
    fetch(img.getAttribute("src"))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        const asset = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
        if (asset.nodeName.toLowerCase() !== "svg") return;
        asset.removeAttribute("style");
        asset.setAttribute("x", "0");
        asset.setAttribute("y", "0");

        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "transicao__svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.appendChild(document.importNode(asset, true));
        img.replaceWith(svg);
        update();
      })
      .catch(() => {});

    function update() {
      const rect = section.getBoundingClientRect();
      const W = stage.clientWidth;
      const H = stage.clientHeight;

      // Fora da tela (com folga): não recalcula
      if (rect.bottom < -H || rect.top > H * 2) return;

      // Entrada (seção subindo até encostar no topo) e progresso com palco fixo
      const enter = clamp(1 - rect.top / H);
      const p = clamp(-rect.top / (rect.height - H));

      const base = Math.min(140, W * 0.32); // tamanho do logo pequeno (px)

      section.style.setProperty("--stage", smooth(0.05, 0.75, enter).toFixed(4));
      section.style.setProperty("--logo", smooth(0.35, 0.95, enter).toFixed(4));
      section.style.setProperty("--fade", smooth(FADE_START, FADE_END, p).toFixed(4));

      // Tamanho do logo na tela (px) e ponto do vetor que fica no centro da tela
      let size;
      let cx = CENTER;
      let cy = CENTER;

      if (p <= 0) {
        size = base * (0.85 + 0.15 * smooth(0, 1, enter));
      } else {
        // Deslocamento (px) do ponto de foco em relação ao centro quando o zoom começa;
        // ele fica parado na tela enquanto o vetor cresce ao redor dele.
        const u0 = VB / base;
        const dx = (FOCUS.x - CENTER) / u0;
        const dy = (FOCUS.y - CENTER) / u0;

        // Tamanho final: o raio ao redor do foco cobre o canto mais distante.
        const fx = W / 2 + dx;
        const fy = H / 2 + dy;
        const reach = Math.hypot(Math.max(fx, W - fx), Math.max(fy, H - fy)) * 1.15;
        const sizeEnd = (reach * VB) / FOCUS_R;

        const k = Math.pow(clamp(p / ZOOM_END), ZOOM_EASE);
        size = Math.exp(Math.log(base) + (Math.log(sizeEnd) - Math.log(base)) * k);

        const u = VB / size;
        cx = FOCUS.x - dx * u;
        cy = FOCUS.y - dy * u;
      }

      if (svg) {
        const u = VB / size; // unidades do SVG por pixel
        const vb = [cx - (W / 2) * u, cy - (H / 2) * u, W * u, H * u];
        svg.setAttribute("viewBox", vb.map((n) => n.toFixed(3)).join(" "));
      } else {
        // Fallback sem SVG inline: escala o <img> em torno do mesmo ponto.
        const scale = size / 140;
        const ox = ((cx - CENTER) / VB) * size;
        const oy = ((cy - CENTER) / VB) * size;
        img.style.transform = `translate(calc(-50% - ${ox}px), calc(-50% - ${oy}px)) scale(${scale})`;
      }
    }

    updaters.push(update);
  });

  let ticking = false;
  const run = () => {
    ticking = false;
    updaters.forEach((fn) => fn());
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(run);
    }
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  run();
})();
