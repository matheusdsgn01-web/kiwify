/**
 * Seção 5 — interações
 *  - Chat do suporte: as mensagens entram em sequência quando o card aparece na tela.
 *  - Toggle de saques: alterna entre "Cartão em 2 dias" e "Em 15 dias".
 */
(() => {
  const section = document.querySelector(".posvenda");
  if (!section) return;

  const forceAnim = new URLSearchParams(location.search).has("anim");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceAnim;

  // Chat em sequência
  const chat = section.querySelector(".chat");
  if (chat && !reduced && "IntersectionObserver" in window) {
    section.classList.add("js-anim");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          chat.classList.add("is-playing");
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(chat);
  } else if (chat) {
    chat.classList.add("is-playing");
  }

  // Toggle 2 / 15 dias
  const saques = section.querySelector(".bento-card--saques");
  const buttons = saques ? saques.querySelectorAll(".toggle button") : [];
  const num = saques && saques.querySelector(".saques__num");
  const chip = saques && saques.querySelector(".trilhas__chip--cartao");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const quinze = btn.dataset.prazo === "15";
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      saques.classList.toggle("saques--15", quinze);
      num.textContent = quinze ? "15" : "2";
      chip.textContent = quinze ? "Liberado" : "Antecipado";
    });
  });
})();
