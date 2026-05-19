(() => {
  const previous = new Map();
  const root = document.querySelector('[data-gb-root]');
  const meteorHost = document.querySelector('.gb-meteors');

  const spawnMeteors = (outcome) => {
    if (!meteorHost) return;
    const count = 14;
    const color = outcome === 'defeat' ? '#ff5a8a' : '#6cf';
    for (let i = 0; i < count; i++) {
      const m = document.createElement('span');
      m.className = 'gb-meteor';
      m.style.background = `linear-gradient(180deg, transparent, #fff, ${color} 80%, transparent)`;
      m.style.boxShadow = `0 0 14px ${color}`;
      const startX = Math.random() * 120 - 10;
      const startY = Math.random() * 60 - 30;
      const angle = 30 + Math.random() * 20;
      m.style.left = `${startX}%`;
      m.style.top = `${startY}%`;
      m.style.transform = `rotate(${angle}deg)`;
      meteorHost.appendChild(m);
      const travel = 600 + Math.random() * 300;
      m.animate(
        [
          { opacity: 0, transform: `rotate(${angle}deg) translateY(-200px)` },
          { opacity: 1, offset: 0.2 },
          { opacity: 1, offset: 0.8 },
          { opacity: 0, transform: `rotate(${angle}deg) translateY(${travel}px)` },
        ],
        { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.4,.1,.7,1)', fill: 'forwards' }
      ).onfinish = () => m.remove();
    }
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.remove('gb-bump');
      void digit.offsetWidth;
      digit.classList.add('gb-bump');
    }
    if (!root) return;
    root.classList.remove('gb-fx-win', 'gb-fx-lose');
    void root.offsetWidth;
    if (outcome === 'victory') root.classList.add('gb-fx-win');
    else if (outcome === 'defeat') root.classList.add('gb-fx-lose');
    spawnMeteors(outcome);
    setTimeout(() => root.classList.remove('gb-fx-win', 'gb-fx-lose'), 1500);
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
