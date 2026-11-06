/**
 * Seção 8 — depoimentos em vídeo.
 * Para ligar um vídeo, preencha data-video="caminho/do/video.mp4" no <article class="depo">.
 * Ao clicar, o vídeo toca dentro do próprio card (com controles). Sem data-video,
 * o card fica só com a foto e o botão de play (como no Figma).
 */
(() => {
  document.querySelectorAll(".depo").forEach((card) => {
    const play = card.querySelector(".depo__play");
    const src = card.dataset.video;

    const start = () => {
      if (!src || card.querySelector("video")) return;
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      card.appendChild(video);
      video.play().catch(() => {});
    };

    card.addEventListener("click", start);
    play.addEventListener("click", (e) => {
      e.stopPropagation();
      start();
    });
  });
})();
