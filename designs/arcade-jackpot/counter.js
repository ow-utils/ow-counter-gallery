(() => {
  const previous = new Map();
  const root = document.querySelector('[data-aj-root]');
  const coinHost = document.querySelector('.aj-coins');
  const jackpotFlash = document.querySelector('.aj-jackpot-flash');

  const victoryShouts = [
    "NERF THIS!!",
    "IT'S HIGH NOON!!",
    "JUSTICE RAINS FROM ABOVE!!",
    "HAMMER DOWN!!",
    "DEATH BLOSSOM!!",
    "MOLTEN CORE!!",
    "DRAGONSTRIKE!!",
    "FIRE IN THE HOLE!!",
    "EXPERIENCE TRANQUILITY!!",
    "RYUU GA WAGA TEKI WO KURAU!!",
    "HEROES NEVER DIE!!",
    "PLAY OF THE GAME!!",
    "ON FIRE!!",
  ];

  const spawnCoins = () => {
    if (!coinHost) return;
    for (let i = 0; i < 32; i++) {
      const c = document.createElement('span');
      c.className = 'aj-coin';
      const startX = 30 + Math.random() * 40;
      c.style.left = `${startX}%`;
      c.style.top = '55%';
      coinHost.appendChild(c);
      const dx = (Math.random() - 0.5) * 700;
      const peak = -180 - Math.random() * 120;
      c.animate(
        [
          { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${peak}px)) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + 260px)) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
        ],
        { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.25,.1,.6,1)', fill: 'forwards' }
      ).onfinish = () => c.remove();
    }
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.add('aj-rolling');
      setTimeout(() => digit.classList.remove('aj-rolling'), 1300);
    }
    if (outcome === 'victory') {
      if (jackpotFlash) {
        jackpotFlash.textContent = victoryShouts[Math.floor(Math.random() * victoryShouts.length)];
      }
      root?.classList.remove('aj-jackpot');
      void root?.offsetWidth;
      root?.classList.add('aj-jackpot');
      spawnCoins();
      setTimeout(() => root?.classList.remove('aj-jackpot'), 1600);
    } else if (outcome === 'defeat' && digit) {
      digit.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(0.4) saturate(0.5)' }, { filter: 'brightness(1)' }],
        { duration: 700 }
      );
    }
  };

  const setCounter = (key, value, outcome) => {
    const prev = previous.get(key);
    const changed = prev !== undefined && prev !== value;
    document.querySelectorAll(`[data-counter="${key}"]`).forEach((el) => {
      el.textContent = value;
      if (changed) playFx(el, outcome);
    });
    previous.set(key, value);
  };

  const apply = (payload) => {
    setCounter('victories', String(Number(payload.victories ?? 0)), 'victory');
    setCounter('defeats', String(Number(payload.defeats ?? 0)), 'defeat');
  };

  fetch('/api/status')
    .then((r) => r.json())
    .then(apply)
    .catch((e) => console.error('initial status fetch failed', e))
    .finally(() => {
      const es = new EventSource('/events');
      es.addEventListener('counter-update', (e) => apply(JSON.parse(e.data)));
      es.onerror = () => console.error('SSE connection error');
    });
})();
