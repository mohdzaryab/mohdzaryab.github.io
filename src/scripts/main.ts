import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initHero } from './hero';

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* ---------- smooth scroll ---------- */
const lenis = new Lenis({ lerp: reduce ? 1 : 0.09, smoothWheel: !reduce });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    if (id.length < 2) return;
    e.preventDefault();
    lenis.scrollTo(id, { offset: 0, duration: 1.4 });
  }),
);

/* ---------- WebGL hero ---------- */
initHero($<HTMLCanvasElement>('#gl'));

/* ---------- split text into chars / words ---------- */
function splitChars(el: HTMLElement) {
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text]
    .map((c) => `<span class="char" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`)
    .join('');
  return $$('.char', el);
}
function splitWords(el: HTMLElement) {
  el.innerHTML = el.innerHTML
    .split(/(\s+)/)
    .map((w) => (w.trim() ? `<span class="word">${w}</span>` : w))
    .join('');
  return $$('.word', el);
}

/* ---------- clock ---------- */
const clock = $('#clock');
const tz = clock.dataset.tz!;
const tick = () =>
  (clock.textContent = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: tz,
  }).format(new Date()));
tick();
setInterval(tick, 1000);

/* ---------- intro ---------- */
const heroChars = $$<HTMLElement>('[data-split-chars]').flatMap(splitChars);
const counter = $('#loader-count');
const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
if (reduce) {
  $('#loader').remove();
} else {
  lenis.stop();
  const n = { v: 0 };
  intro
    .to(n, {
      v: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => (counter.textContent = String(Math.round(n.v)).padStart(3, '0')),
    })
    .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' })
    .from(heroChars, { yPercent: 110, rotate: 8, duration: 1.4, stagger: 0.035 }, '-=0.55')
    .from('[data-hero-fade]', { y: 24, opacity: 0, duration: 1.2, stagger: 0.08 }, '-=1.1')
    .add(() => {
      $('#loader').remove();
      lenis.start();
    });
}

/* ---------- hero parallax on scroll ---------- */
gsap.to('.hero-title', {
  yPercent: -35,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
});

/* ---------- section headings ---------- */
$$<HTMLElement>('[data-reveal-title]').forEach((el) => {
  const chars = splitChars(el);
  gsap.from(chars, {
    yPercent: 110,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.02,
    scrollTrigger: { trigger: el, start: 'top 85%' },
  });
});

/* ---------- generic fade-ups ---------- */
$$<HTMLElement>('[data-reveal]').forEach((el) => {
  gsap.from(el, {
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    delay: Number(el.dataset.delay ?? 0),
    scrollTrigger: { trigger: el, start: 'top 88%' },
  });
});

/* ---------- about: words light up as you scroll ---------- */
const aboutText = $('#about-text');
const words = splitWords(aboutText);
gsap.fromTo(
  words,
  { opacity: 0.14 },
  {
    opacity: 1,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: aboutText, start: 'top 80%', end: 'bottom 45%', scrub: true },
  },
);

/* ---------- counters ---------- */
$$<HTMLElement>('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count);
  const o = { v: 0 };
  gsap.to(o, {
    v: end,
    duration: 1.8,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%' },
    onUpdate: () => (el.textContent = String(Math.round(o.v))),
  });
});

/* ---------- horizontal project rail ---------- */
const mm = gsap.matchMedia();
mm.add('(min-width: 900px)', () => {
  const track = $('.rail-track');
  const rail = $('.rail');
  const dist = () => track.scrollWidth - innerWidth + 64;
  const tween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: rail,
      start: 'top top',
      end: () => '+=' + dist(),
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (s) => gsap.set('.rail-progress span', { scaleX: s.progress }),
    },
  });
  $$('.card').forEach((card) => {
    gsap.from(card.querySelector('.card-art'), {
      scale: 1.25,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        containerAnimation: tween,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    });
  });
});

/* ---------- card tilt + spotlight ---------- */
if (fine && !reduce) {
  $$('.card').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      rx((0.5 - py) * 8);
      ry((px - 0.5) * 10);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

/* ---------- videos only play when visible ---------- */
$$<HTMLVideoElement>('video[data-autoplay]').forEach((v) => {
  new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), {
    threshold: 0.2,
  }).observe(v);
});

/* ---------- archive: image follows cursor ---------- */
const preview = $('#archive-preview');
const previewImg = $<HTMLImageElement>('img', preview);
if (fine) {
  const px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
  const py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
  // Hit-test on both pointer moves and scrolls: with smooth scrolling the rows
  // move under a stationary cursor, so pointerenter/leave alone never fire.
  let mouseX = -1;
  let mouseY = -1;
  let current: HTMLElement | null = null;
  const update = () => {
    if (mouseX < 0) return;
    const row = document.elementFromPoint(mouseX, mouseY)?.closest<HTMLElement>('.archive-row') ?? null;
    if (row === current) return;
    current = row;
    if (row) {
      previewImg.src = row.dataset.image!;
      gsap.to(preview, { opacity: 1, scale: 1, rotate: gsap.utils.random(-6, 6), duration: 0.4 });
    } else {
      gsap.to(preview, { opacity: 0, scale: 0.8, duration: 0.3 });
    }
  };
  addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    px(mouseX);
    py(mouseY);
    update();
  });
  lenis.on('scroll', update);
  document.addEventListener('pointerleave', () => {
    mouseX = -1;
    current = null;
    gsap.to(preview, { opacity: 0, scale: 0.8, duration: 0.3 });
  });
}

/* ---------- custom cursor ---------- */
if (fine && !reduce) {
  const dot = $('#cursor');
  const label = $('#cursor-label');
  document.body.classList.add('has-cursor');
  const cx = gsap.quickTo(dot, 'x', { duration: 0.25, ease: 'power3' });
  const cy = gsap.quickTo(dot, 'y', { duration: 0.25, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    cx(e.clientX);
    cy(e.clientY);
  });
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
    dot.classList.toggle('is-hover', !!t);
    const text = t?.dataset.cursor ?? '';
    label.textContent = text;
    dot.classList.toggle('has-label', !!text);
  });
  document.addEventListener('pointerleave', () => gsap.to(dot, { opacity: 0 }));
  document.addEventListener('pointerenter', () => gsap.to(dot, { opacity: 1 }));
}

/* ---------- magnetic elements ---------- */
if (fine && !reduce) {
  $$('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35;
    const mx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const my = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * strength);
      my((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      mx(0);
      my(0);
    });
  });
}

/* ---------- copy email ---------- */
$$<HTMLButtonElement>('[data-copy]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      const t = $('.copy-hint', btn);
      const prev = t.textContent;
      t.textContent = 'Copied ✓';
      setTimeout(() => (t.textContent = prev), 1600);
    } catch {
      location.href = `mailto:${btn.dataset.copy}`;
    }
  }),
);

/* ---------- nav hides on scroll down ---------- */
let lastY = 0;
lenis.on('scroll', ({ scroll }: { scroll: number }) => {
  const nav = $('.nav');
  nav.classList.toggle('nav-hidden', scroll > lastY && scroll > 200);
  nav.classList.toggle('nav-solid', scroll > 40);
  lastY = scroll;
});

addEventListener('load', () => ScrollTrigger.refresh());
