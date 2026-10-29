/** Progress follows the reader's position; there is no repeating text timer. */
export function setupLessonScroll() {
  const story = document.querySelector(".lesson-story");
  const steps = [...story.querySelectorAll(".lesson-step")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const canPin = matchMedia("(min-width: 900px) and (min-height: 780px)");
  let visible = false;
  let frame = 0;
  let active = -1;

  function render(index) {
    if (active === index) return;
    active = index;
    story.dataset.step = String(index);
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
  }

  function update() {
    frame = 0;
    if (reducedMotion.matches || !canPin.matches) {
      render(2);
      return;
    }
    // A stable reading line makes reversing the scroll reverse the explanation.
    const readingLine = innerHeight * 0.48;
    let index = 0;
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= readingLine) index = i;
    });
    render(index);
  }

  function schedule() {
    if (!frame && visible) frame = requestAnimationFrame(update);
  }

  function configure() {
    story.classList.toggle(
      "is-static",
      reducedMotion.matches || !canPin.matches,
    );
    update();
  }

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    },
    { rootMargin: "100px" },
  ).observe(story);

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener("change", configure);
  canPin.addEventListener("change", configure);
  configure();
}
