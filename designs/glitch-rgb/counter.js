(() => {
  const previous = new Map();
  const root = document.querySelector('[data-gx-root]');
  const rainHost = document.querySelector('.gx-rain');
  const flash = document.querySelector('.gx-flash');
  const barHost = document.querySelector('.gx-glitch-bars');

  const charSet = '01アイウエオカキクケコサシスセソタチツテト#$%&*+=<>/\\';
  const randChar = () => charSet[Math.floor(Math.random() * charSet.length)];

  const startRain = () => {
    if (!rainHost) return;
    const cols = 32;
    for (let i = 0; i < cols; i++) {
      const c = document.createElement('span');
      c.className = 'gx-rain-col';
      c.style.left = `${(i / cols) * 100}%`;
      let str = '';
      const len = 12 + Math.floor(Math.random() * 18);
      for (let k = 0; k < len; k++) str += randChar() + '\n';
      c.textContent = str;
      rainHost.appendChild(c);
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 5;
      c.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${600 + Math.random() * 200}px)` }],
        { duration: dur * 1000, delay: delay * 1000, iterations: Infinity, easing: 'linear' }
      );
      setInterval(() => {
        let s = '';
        for (let k = 0; k < len; k++) s += randChar() + '\n';
        c.textContent = s;
      }, 200 + Math.random() * 400);
    }
  };

  const spawnGlitchBars = () => {
    if (!barHost) return;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('span');
      s.className = 'gx-bar-strip';
      s.style.top = `${Math.random() * 90}%`;
      s.style.height = `${4 + Math.random() * 18}px`;
      s.style.transform = `translateX(${(Math.random() - 0.5) * 40}px)`;
      s.style.background = i % 2 === 0
        ? 'rgba(0, 240, 255, 0.45)'
        : 'rgba(255, 0, 170, 0.45)';
      barHost.appendChild(s);
      s.animate(
        [
          { opacity: 1, transform: `translateX(${(Math.random() - 0.5) * 30}px)` },
          { opacity: 0.5, transform: `translateX(${(Math.random() - 0.5) * 80}px)` },
          { opacity: 0, transform: `translateX(${(Math.random() - 0.5) * 40}px)` },
        ],
        { duration: 350 + Math.random() * 250, easing: 'steps(6)', fill: 'forwards' }
      ).onfinish = () => s.remove();
    }
  };

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.remove('gx-burst');
      void digit.offsetWidth;
      digit.classList.add('gx-burst');
      digit.dataset.text = digit.textContent;
    }
    if (flash) {
      flash.classList.remove('gx-active');
      void flash.offsetWidth;
      flash.classList.add('gx-active');
    }
    spawnGlitchBars();
    if (root) {
      root.animate(
        [
          { transform: 'translate(0,0)' },
          { transform: 'translate(-6px, 2px)' },
          { transform: 'translate(5px, -3px)' },
          { transform: 'translate(-3px, -2px)' },
          { transform: 'translate(0,0)' },
        ],
        { duration: 220, easing: 'steps(5)' }
      );
    }
  };

  const setCounter = (key, value, outcome) => {
    const prev = previous.get(key);
    const changed = prev !== undefined && prev !== value;
    document.querySelectorAll(`[data-counter="${key}"]`).forEach((el) => {
      el.textContent = value;
      el.dataset.text = value;
      if (changed) playFx(el, outcome);
    });
    previous.set(key, value);
  };

  const apply = (payload) => {
    setCounter('victories', String(Number(payload.victories ?? 0)), 'victory');
    setCounter('defeats', String(Number(payload.defeats ?? 0)), 'defeat');
  };

  startRain();
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
