/**
 * Seção 9 — FAQ em acordeão. Uma pergunta aberta por vez; clicar de novo fecha.
 */
(() => {
  const items = document.querySelectorAll(".faq__item");

  items.forEach((item) => {
    const btn = item.querySelector(".faq__pergunta");
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq__pergunta").setAttribute("aria-expanded", "false");
      });
      if (open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
