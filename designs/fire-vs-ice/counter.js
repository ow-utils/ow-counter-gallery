(() => {
  const previous = new Map();
  const root = document.querySelector('[data-fi-root]');
  const emberHost = document.querySelector('.fi-ember-host');
  const shardHost = document.querySelector('.fi-shard-host');

  const spawnEmbers = () => {
    if (!emberHost) return;
    for (let i = 0; i < 36; i++) {
      const e = document.createElement('span');
      e.className = 'fi-ember';
      e.style.left = `${20 + Math.random() * 60}%`;
      e.style.top = '85%';
      const size = 3 + Math.random() * 6;
      e.style.width = `${size}px`;
      e.style.height = `${size}px`;
      emberHost.appendChild(e);
      const dx = (Math.random() - 0.5) * 240;
      const dy = -200 - Math.random() * 180;
      e.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(1.2)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' }
      ).onfinish = () => e.remove();
    }
  };

  const spawnShards = () => {
    if (!shardHost) return;
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      s.className = 'fi-shard';
      s.style.left = `${40 + Math.random() * 30}%`;
      s.style.top = `${30 + Math.random() * 30}%`;
      shardHost.appendChild(s);
      const dx = (Math.random() - 0.5) * 380;
      const dy = (Math.random() - 0.5) * 280;
      const rot = (Math.random() - 0.5) * 720;
      s.animate(
        [
          { transform: 'translate(0,0) rotate(0)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.5,.4,1)', fill: 'forwards' }
      ).onfinish = () => s.remove();
    }
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      const cls = outcome === 'victory' ? 'fi-burst-fire' : 'fi-burst-ice';
      digit.classList.remove('fi-burst-fire', 'fi-burst-ice');
      void digit.offsetWidth;
      digit.classList.add(cls);
    }
    if (!root) return;
    root.classList.remove('fi-fx-win', 'fi-fx-lose');
    void root.offsetWidth;
    if (outcome === 'victory') {
      root.classList.add('fi-fx-win');
      spawnEmbers();
    } else if (outcome === 'defeat') {
      root.classList.add('fi-fx-lose');
      spawnShards();
    }
    setTimeout(() => root.classList.remove('fi-fx-win', 'fi-fx-lose'), 1300);
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
