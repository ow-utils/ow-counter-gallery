(() => {
  const previous = new Map();
  const root = document.querySelector('[data-cp-root]');
  const burstText = document.querySelector('.cp-burst-text');
  const starHost = document.querySelector('.cp-stars');

  const winShouts = ['POW!!', 'BAM!!', 'BOOM!!', 'KAPOW!!', 'ZAP!!', 'SMASH!!', 'WHAM!!', 'YEAH!!'];
  const loseShouts = ['OUCH!!', 'OOF!!', 'KABLAM!!', 'SPLAT!!', 'AARGH!!', 'NOOO!!'];

  const spawnStars = (outcome) => {
    if (!starHost) return;
    const color = outcome === 'victory' ? '#34d3ff' : '#ff5555';
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'cp-star';
      s.style.background = i % 3 === 0 ? '#ffe22e' : color;
      const startX = 40 + Math.random() * 20;
      const startY = 40 + Math.random() * 20;
      s.style.left = `${startX}%`;
      s.style.top = `${startY}%`;
      const sz = 18 + Math.random() * 22;
      s.style.width = `${sz}px`;
      s.style.height = `${sz}px`;
      starHost.appendChild(s);
      const angle = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 200;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 720;
      s.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }
      ).onfinish = () => s.remove();
    }
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.remove('cp-pop');
      void digit.offsetWidth;
      digit.classList.add('cp-pop');
    }
    if (!root || !burstText) return;
    const pool = outcome === 'victory' ? winShouts : loseShouts;
    burstText.textContent = pool[Math.floor(Math.random() * pool.length)];
    root.classList.remove('cp-fx-win', 'cp-fx-lose', 'cp-shake');
    void root.offsetWidth;
    root.classList.add(outcome === 'victory' ? 'cp-fx-win' : 'cp-fx-lose', 'cp-shake');
    spawnStars(outcome);
    setTimeout(() => root.classList.remove('cp-fx-win', 'cp-fx-lose', 'cp-shake'), 1400);
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
