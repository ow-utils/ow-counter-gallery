(() => {
  const previous = new Map();
  const root = document.querySelector('[data-mh-root]');
  const bannerText = document.querySelector('.mh-banner-text');

  const winShouts = [
    'TARGET ELIMINATED',
    'ENEMY DOWN',
    'KILL CONFIRMED',
    'OBJECTIVE SECURED',
    'MISSION ACCOMPLISHED',
    'HEROES NEVER DIE',
    'PLAY OF THE GAME',
  ];
  const loseShouts = [
    'CRITICAL DAMAGE',
    'SYSTEM FAILURE',
    'UNIT LOST',
    'EJECT! EJECT!',
    'OBJECTIVE LOST',
    'NEED HEALING',
  ];

  const playFx = (digit, outcome) => {
    if (digit) {
      digit.classList.remove('mh-lock');
      void digit.offsetWidth;
      digit.classList.add('mh-lock');
    }
    if (!root || !bannerText) return;
    const pool = outcome === 'victory' ? winShouts : loseShouts;
    bannerText.textContent = pool[Math.floor(Math.random() * pool.length)];
    root.classList.remove('mh-fx-win', 'mh-fx-lose');
    void root.offsetWidth;
    root.classList.add(outcome === 'victory' ? 'mh-fx-win' : 'mh-fx-lose');
    setTimeout(() => root.classList.remove('mh-fx-win', 'mh-fx-lose'), 1500);
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
