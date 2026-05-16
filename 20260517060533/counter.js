(() => {
  const previousCounters = new Map();
  const hud = document.querySelector("[data-hud-root]");
  const splash = document.querySelector(".impact-splash");
  const particleHost = document.querySelector(".particle-host");

  const splashText = {
    victory: "WIN!!",
    defeat: "LOSE!!",
    draw: "DRAW",
  };

  const particleColors = {
    victory: ["#00f5ff", "#7affff", "#ffffff", "#b388ff"],
    defeat: ["#ff2bd6", "#ff8ae8", "#ffffff", "#ff6b35"],
    draw: ["#ffffff", "#b388ff", "#00f5ff", "#ff2bd6"],
  };

  const syncGhost = (element) => {
    const cage = element?.closest(".digit-cage");
    const ghost = cage?.querySelector(".digit-ghost");
    if (ghost) ghost.textContent = element.textContent;
  };

  const spawnParticles = (outcome) => {
    if (!particleHost) return;
    const colors = particleColors[outcome] ?? particleColors.victory;
    const originX = 50 + (outcome === "defeat" ? 22 : outcome === "victory" ? -22 : 0);
    const originY = 50;

    for (let i = 0; i < 28; i += 1) {
      const p = document.createElement("span");
      p.className = "particle";
      const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4;
      const dist = 80 + Math.random() * 160;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const color = colors[i % colors.length];
      const size = 6 + Math.random() * 10;

      p.style.left = `${originX}%`;
      p.style.top = `${originY}%`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = color;
      p.style.boxShadow = `0 0 12px ${color}`;
      particleHost.appendChild(p);

      p.animate(
        [
          {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1)",
          },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(${180 + Math.random() * 180}deg)`,
          },
        ],
        {
          duration: 700 + Math.random() * 500,
          easing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
          fill: "forwards",
        },
      ).onfinish = () => p.remove();
    }
  };

  const playHudFx = (outcome) => {
    if (!hud || (outcome !== "victory" && outcome !== "defeat" && outcome !== "draw")) {
      return;
    }
    const fxClass = outcome === "draw" ? "fx-victory" : `fx-${outcome}`;
    hud.classList.remove("fx-victory", "fx-defeat");
    void hud.offsetWidth;
    hud.classList.add(fxClass);

    if (splash) {
      splash.textContent = splashText[outcome] ?? "";
    }

    spawnParticles(outcome);

    const cleanup = () => {
      hud.classList.remove("fx-victory", "fx-defeat");
    };
    hud.addEventListener("animationend", cleanup, { once: true });
    window.setTimeout(cleanup, 1200);
  };

  const playBump = (element, outcome) => {
    if (!element || typeof element.animate !== "function") {
      return;
    }

    element.classList.add("is-rolling");
    window.setTimeout(() => element.classList.remove("is-rolling"), 420);

    const isWin = outcome === "victory";
    const isLose = outcome === "defeat";
    const hue = isWin
      ? "0, 245, 255"
      : isLose
        ? "255, 43, 214"
        : "255, 255, 255";

    element.animate(
      [
        {
          transform: "translateY(0) scale(1) rotate(0deg)",
          filter: `drop-shadow(0 0 0 rgba(${hue}, 0))`,
        },
        {
          transform: "translateY(-18px) scale(1.8) rotate(-8deg)",
          filter: `drop-shadow(0 0 40px rgba(${hue}, 1)) drop-shadow(0 0 80px rgba(${hue}, 0.7)) brightness(1.5)`,
        },
        {
          transform: "translateY(8px) scale(0.75) rotate(6deg)",
          filter: `drop-shadow(0 0 20px rgba(${hue}, 0.6))`,
        },
        {
          transform: "translateY(-6px) scale(1.35) rotate(-3deg)",
          filter: `drop-shadow(0 0 32px rgba(${hue}, 0.85))`,
        },
        {
          transform: "translateY(0) scale(1) rotate(0deg)",
          filter: `drop-shadow(0 0 0 rgba(${hue}, 0))`,
        },
      ],
      { duration: 1100, easing: "cubic-bezier(0.15, 1.35, 0.25, 1)" },
    );
  };

  const setCounterText = (key, value, outcome) => {
    const previousValue = previousCounters.get(key);
    const changed = previousValue !== undefined && previousValue !== value;

    document.querySelectorAll(`[data-counter="${key}"]`).forEach((element) => {
      element.textContent = value;
      syncGhost(element);
      if (changed) {
        playBump(element, outcome);
      }
    });

    previousCounters.set(key, value);
  };

  const applyCounterUpdate = (payload) => {
    const victories = Number(payload.victories ?? 0);
    const defeats = Number(payload.defeats ?? 0);
    const draws = Number(payload.draws ?? 0);
    const lastOutcome = (payload.last_outcome ?? "").toString();

    setCounterText("victories", String(victories), "victory");
    setCounterText("defeats", String(defeats), "defeat");
    setCounterText("draws", String(draws), "draw");

    if (lastOutcome) {
      playHudFx(lastOutcome);
    }

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

  document.querySelectorAll("[data-counter]").forEach(syncGhost);

  fetchStatus()
    .catch((error) => {
      console.error("initial status fetch failed", error);
    })
    .finally(() => {
      connectEvents();
    });
})();
