/**
 * Hero — fundo 100% vídeo (logo 3D).
 * O hero abre no fundo escuro da cena e o vídeo surge (fade) assim que o primeiro
 * quadro está pronto. Toca em loop sem som e pausa fora da tela.
 * Com "reduzir movimento" ativo (e sem ?anim), o vídeo fica parado no 1º quadro.
 */
(() => {
  const media = document.querySelector(".hero__media");
  const video = media && media.querySelector(".hero__video");
  if (!video) return;

  const forceAnim = new URLSearchParams(location.search).has("anim");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim;

  video.muted = true; // exigido para autoplay

  // Mostra o vídeo quando o 1º quadro estiver disponível
  const reveal = () => video.classList.add("is-ready");
  if (video.readyState >= 2) reveal();
  else video.addEventListener("loadeddata", reveal, { once: true });

  // Telas estreitas (≤768px): a regra do desktop deixaria o bloco embaixo do título.
  // Aqui o vídeo é posicionado para o bloco ficar centralizado ACIMA do título,
  // com respiro. Proporções do bloco no quadro do vídeo (medidas no arquivo):
  const BLOCK = { cx: 0.51, top: 0.17, bottom: 0.7 };
  const GAP = 36; // px entre a base do bloco e o título
  const hero = media.closest(".hero");
  const title = hero.querySelector(".hero__title");
  const nav = document.querySelector(".nav");
  const compact = window.matchMedia("(max-width: 768px)");

  const layout = () => {
    if (!compact.matches) {
      video.style.cssText = "";
      return;
    }
    const W = media.clientWidth;
    const heroTop = hero.getBoundingClientRect().top;
    const titleTop = title.getBoundingClientRect().top - heroTop;
    const navBottom = nav ? nav.offsetHeight : 72;
    const space = titleTop - GAP - (navBottom + 16); // altura livre para o bloco
    const maxW = Math.min(W * 1.9, 900); // no tablet o bloco não passa de ~35% da largura
    const h = Math.min((maxW * 9) / 16, space / (BLOCK.bottom - BLOCK.top));
    const w = (h * 16) / 9;
    const top = titleTop - GAP - BLOCK.bottom * h;
    video.style.left = W / 2 - BLOCK.cx * w + "px";
    video.style.top = top + "px";
    video.style.bottom = "auto";
    video.style.width = w + "px";
  };
  layout();
  window.addEventListener("resize", layout);
  if (document.fonts) document.fonts.ready.then(layout);

  if (reduced) {
    video.removeAttribute("autoplay");
    video.pause();
    return;
  }

  const play = () => video.play().catch(() => {});

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? play() : video.pause()));
    }).observe(media);
  } else {
    play();
  }
})();
