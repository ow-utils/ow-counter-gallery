(() => {
  const previous = new Map();
  const petalHost = document.querySelector('.sb-petals');
  const splash = document.querySelector('.sb-splash');
  const thunder = document.querySelector('.sb-thunder');

  const spawnPetals = () => {
    if (!petalHost) return;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('span');
      p.className = 'sb-petal';
      const startX = Math.random() * 100;
      p.style.left = `${startX}%`;
      p.style.top = `-20px`;
      petalHost.appendChild(p);
      const drift = (Math.random() - 0.5) * 200;
      const rot = Math.random() * 720;
      p.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
          { opacity: 1, offset: 0.1 },
          { opacity: 1, offset: 0.85 },
          { transform: `translate(${drift}px, 420px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 2400 + Math.random() * 1200, easing: 'cubic-bezier(.4,.05,.7,1)', fill: 'forwards' }
      ).onfinish = () => p.remove();
    }
  };

  const flashInk = () => {
    if (!splash) return;
    splash.classList.remove('sb-active');
    void splash.offsetWidth;
    splash.classList.add('sb-active');
  };
  const flashThunder = () => {
    if (!thunder) return;
    thunder.classList.remove('sb-active');
    void thunder.offsetWidth;
    thunder.classList.add('sb-active');
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.remove('sb-write');
      void digit.offsetWidth;
      digit.classList.add('sb-write');
      const stamp = digit.parentElement?.querySelector('.sb-stamp');
      if (stamp) {
        stamp.classList.remove('sb-pop');
        void stamp.offsetWidth;
        stamp.classList.add('sb-pop');
      }
    }
    if (outcome === 'victory') {
      spawnPetals();
      flashInk();
    } else if (outcome === 'defeat') {
      flashThunder();
      flashInk();
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
