(() => {
  const previous = {
    victories: undefined,
    defeats: undefined,
  };

  const root = document.querySelector("[data-gbo-root]");
  const resultTitle = document.querySelector("[data-gbo-result-title]");
  const resultLabel = document.querySelector("[data-gbo-result-label]");
  const resultValue = document.querySelector("[data-gbo-result-value]");

  let cleanupTimer = 0;

  const toCount = (value) => {
    const number = Number(value ?? 0);
    return Number.isFinite(number) ? number : 0;
  };

  const updateCounter = (key, value) => {
    document.querySelectorAll(`[data-counter="${key}"]`).forEach((element) => {
      element.textContent = String(value);
    });
  };

  const tickScorebug = (key) => {
    document.querySelectorAll(`[data-counter="${key}"]`).forEach((element) => {
      element.classList.remove("is-tick");
      void element.offsetWidth;
      element.classList.add("is-tick");
    });
  };

  const playResult = (outcome, value) => {
    if (!root || !resultTitle || !resultLabel || !resultValue) return;

    const isVictory = outcome === "victory";
    resultTitle.textContent = isVictory ? "VICTORY +1" : "DEFEAT +1";
    resultLabel.textContent = isVictory ? "WIN" : "LOSE";
    resultValue.textContent = String(value);

    window.clearTimeout(cleanupTimer);
    root.classList.remove("is-playing", "is-victory", "is-defeat");
    void root.offsetWidth;
    root.classList.add(isVictory ? "is-victory" : "is-defeat", "is-playing");

    cleanupTimer = window.setTimeout(() => {
      root.classList.remove("is-playing", "is-victory", "is-defeat");
    }, 3700);
  };

  const apply = (payload) => {
    const victories = toCount(payload.victories);
    const defeats = toCount(payload.defeats);

    const victoryDelta = previous.victories === undefined ? 0 : victories - previous.victories;
    const defeatDelta = previous.defeats === undefined ? 0 : defeats - previous.defeats;

    updateCounter("victories", victories);
    updateCounter("defeats", defeats);

    if (victoryDelta > 0 || defeatDelta > 0) {
      if (victoryDelta > 0) {
        tickScorebug("victories");
        playResult("victory", victories);
      } else {
        tickScorebug("defeats");
        playResult("defeat", defeats);
      }
    }

    previous.victories = victories;
    previous.defeats = defeats;
  };

  fetch("/api/status")
    .then((response) => response.json())
    .then(apply)
    .catch((error) => console.error("initial status fetch failed", error))
    .finally(() => {
      const eventSource = new EventSource("/events");
      eventSource.addEventListener("counter-update", (event) => {
        apply(JSON.parse(event.data));
      });
      eventSource.onerror = () => console.error("SSE connection error");
    });
})();
