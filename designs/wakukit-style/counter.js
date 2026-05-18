(() => {
  const previousCounters = new Map();
  const root = document.querySelector("[data-wks-root]");
  const animTimeout = 1800;
  let animTimer = null;

  const playOutcomeAnime = (outcome) => {
    if (!root) return;
    if (outcome !== "victory" && outcome !== "defeat") return;

    root.classList.remove("win-anime", "lose-anime");
    void root.offsetWidth;
    root.classList.add(outcome === "victory" ? "win-anime" : "lose-anime");

    if (animTimer) clearTimeout(animTimer);
    animTimer = window.setTimeout(() => {
      root.classList.remove("win-anime", "lose-anime");
    }, animTimeout);
  };

  const playBump = (element) => {
    if (!element) return;
    element.classList.remove("is-bump");
    void element.offsetWidth;
    element.classList.add("is-bump");
    window.setTimeout(() => element.classList.remove("is-bump"), 500);
  };

  const setCounterText = (key, value, outcome) => {
    const previousValue = previousCounters.get(key);
    const changed = previousValue !== undefined && previousValue !== value;

    document.querySelectorAll(`[data-counter="${key}"]`).forEach((element) => {
      element.textContent = value;
      if (changed) playBump(element);
    });

    previousCounters.set(key, value);
    return changed;
  };

  const applyCounterUpdate = (payload) => {
    const victories = Number(payload.victories ?? 0);
    const defeats = Number(payload.defeats ?? 0);
    const draws = Number(payload.draws ?? 0);
    const lastOutcome = (payload.last_outcome ?? "").toString();

    setCounterText("victories", String(victories), "victory");
    setCounterText("defeats", String(defeats), "defeat");
    setCounterText("draws", String(draws), "draw");

    if (lastOutcome) playOutcomeAnime(lastOutcome);

    document.body.dataset.lastOutcome = lastOutcome;
  };

  const fetchStatus = async () => {
    const response = await fetch("/api/status");
    if (!response.ok) {
      throw new Error(`status request failed: ${response.status}`);
    }
    applyCounterUpdate(await response.json());
  };

  const connectEvents = () => {
    const eventSource = new EventSource("/events");
    eventSource.addEventListener("counter-update", (event) => {
      applyCounterUpdate(JSON.parse(event.data));
    });
    eventSource.onerror = () => {
      console.error("SSE connection error");
    };
  };

  fetchStatus()
    .catch((error) => {
      console.error("initial status fetch failed", error);
    })
    .finally(() => {
      connectEvents();
    });
})();
