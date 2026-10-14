/* ═══════════════════════════════════════════════════════════════
   Biswarup Mondal — Portfolio · Main Script
   Three.js parallax field · GSAP reveal animations · Lenis scroll
   ═══════════════════════════════════════════════════════════════ */
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/* ── Constants & State ─────────────────────────────────────── */
const DOC  = document.documentElement;
const BODY = document.body;
const MQ_MOBILE    = window.matchMedia('(max-width: 900px)');
const MQ_REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)');
const IS_REDUCED   = MQ_REDUCED.matches;

const state = {
  scroll:  0,                    // normalised 0-1
  pointer: { x: 0.5, y: 0.5 },  // normalised cursor
};


/* ── 1. Lenis Smooth-Scroll ───────────────────────────────── */
let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}


/* ── 2. Cursor Blob ────────────────────────────────────────── */
function initCursor() {
  const blob = document.getElementById('cursor-blob');
  if (!blob || MQ_MOBILE.matches) return;

  const xTo = gsap.quickTo(blob, 'x', { duration: 0.6, ease: 'expo.out' });
  const yTo = gsap.quickTo(blob, 'y', { duration: 0.6, ease: 'expo.out' });

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    state.pointer.x = e.clientX / window.innerWidth;
    state.pointer.y = e.clientY / window.innerHeight;
  });
}


/* ── 3. Scroll Rail Indicator ──────────────────────────────── */
function initScrollRail() {
  const fill = document.getElementById('rail-fill');
  if (!fill) return;

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      state.scroll = self.progress;
      fill.style.transform = `scaleY(${self.progress})`;
    },
  });
}


/* ── 4. Reveal Animations ──────────────────────────────────── */
function initReveals() {
  document.querySelectorAll('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      onEnter: () => el.classList.add('is-in'),
      once: true,
    });
  });
}


/* ── 5. Hero Parallax Words ────────────────────────────────── */
function initHeroParallax() {
  document.querySelectorAll('.hero-word').forEach((word) => {
    const speed = parseFloat(word.dataset.speed) || 1;
    gsap.to(word, {
      yPercent: speed * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}


/* ── 6. Marquee Velocity Skew ──────────────────────────────── */
function initMarquee() {
  const inner = document.getElementById('marquee-inner');
  if (!inner) return;

  const totalW = inner.scrollWidth / 2;
  const wrap = gsap.utils.wrap(0, -totalW);
  let x = 0;
  let speed = -1;

  gsap.ticker.add(() => {
    x += speed;
    gsap.set(inner, { x: wrap(x) });
  });

  ScrollTrigger.create({
    onUpdate(self) {
      speed = -1 - self.getVelocity() / 3000;
    },
  });
}


/* ── 7. Tilt on Skill Panels ──────────────────────────────── */
function initTilt() {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, {
        rotateY: cx * 14,
        rotateX: -cy * 14,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
}


/* ── 8. Footer Clock ───────────────────────────────────────── */
function initClock() {
  const el = document.getElementById('footer-time');
  if (!el) return;

  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-IN', {
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
  }
  tick();
  setInterval(tick, 1000);
}


/* ── 9. Three.js Gold Terrain Field ────────────────────────── */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;

  varying vec2  vUv;
  varying float vElevation;

  // simplex-style hash
  vec3 hash(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(mix(dot(hash(i + vec3(0,0,0)), f - vec3(0,0,0)),
              dot(hash(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
          mix(dot(hash(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(mix(dot(hash(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
          mix(dot(hash(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z
    );
  }

  void main() {
    vUv = uv;

    vec3 pos = position;

    float wave  = noise(vec3(pos.x * 1.8 + uTime * 0.12,
                             pos.y * 1.8 + uTime * 0.08,
                             uTime * 0.10)) * 0.30;
    float ripple = noise(vec3(pos.x * 3.5 - uTime * 0.15,
                              pos.y * 3.5 + uTime * 0.18,
                              uTime * 0.22)) * 0.10;
    float drift  = sin(pos.x * 1.2 + uTime * 0.20 + uScroll * 3.0) * 0.06;

    pos.z += wave + ripple + drift;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2  uPointer;
  uniform float uScroll;
  uniform float uReveal;

  varying vec2  vUv;
  varying float vElevation;

  void main() {
    /* Black ground. Gold survives only as a thin ridge on the highest
       sliver of elevation, so the field can never outshine body copy. */
    vec3 amber = vec3(0.010, 0.0075, 0.0015);
    vec3 gold  = vec3(0.240, 0.190, 0.040);

    float e     = clamp(vElevation, -1.0, 1.0);
    float body  = pow(clamp(1.0 - abs(e) * 2.6, 0.0, 1.0), 1.6);
    float ridge = smoothstep(0.22, 0.52, e);

    vec3 col = amber * body + gold * ridge;

    float bloom = 1.0 - smoothstep(0.0, 0.22, distance(vUv, uPointer));
    col += gold * bloom * 0.06;

    float band = 1.0 - abs(vUv.y - (0.58 - uScroll * 0.35)) * 3.0;
    col += amber * 0.30 * clamp(band, 0.0, 1.0);

    float sideFade = 1.0 - smoothstep(0.34, 0.48, abs(vUv.x - 0.5));
    col *= mix(0.25, 1.0, sideFade);

    float vig = 1.0 - smoothstep(0.30, 0.95, length((vUv - 0.5) * vec2(1.0, 1.15)));
    col *= mix(0.45, 1.0, vig);

    col *= uReveal;
    gl_FragColor = vec4(col, 1.0);
  }
`;

let webglScene = null;

function initWebGL() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return null;

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / Math.max(window.innerHeight, 1), 0.1, 100
    );
    camera.position.set(0, 0, 2.6);

    const uniforms = {
      uTime:    { value: 0 },
      uScroll:  { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uReveal:  { value: IS_REDUCED ? 1 : 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4, 128, 128), material);
    scene.add(mesh);

    const t0 = performance.now();

    function render() {
      uniforms.uTime.value   = IS_REDUCED ? 14 : (performance.now() - t0) / 1000;
      uniforms.uScroll.value = state.scroll;
      uniforms.uPointer.value.set(state.pointer.x, 1 - state.pointer.y);
      camera.position.z = 2.6 - state.scroll * 0.35;
      camera.position.y = state.scroll * 0.12;
      renderer.render(scene, camera);
    }

    function resize() {
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, 1);
      const aspect = w / h;
      const fovH = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360);

      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(fovH * aspect * 1.25, fovH * 1.25, 128, 128);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * (MQ_MOBILE.matches ? 0.75 : 1));
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      if (IS_REDUCED) render();
    }

    resize();

    if (IS_REDUCED) {
      render();
    } else {
      gsap.to(uniforms.uReveal, { value: 1, duration: 1.6, ease: 'sine.out' });
      renderer.setAnimationLoop(render);
    }

    document.addEventListener('visibilitychange', () => {
      if (!IS_REDUCED) renderer.setAnimationLoop(document.hidden ? null : render);
    });

    window.addEventListener('resize', resize);

    return { render, resize };
  } catch (err) {
    console.warn('WebGL field unavailable, using CSS gold gradient fallback:', err);
    DOC.classList.add('no-webgl');
    return null;
  }
}


/* ── Boot ───────────────────────────────────────────────────── */
function boot() {
  initLenis();
  initCursor();
  initScrollRail();
  initReveals();
  initHeroParallax();
  initMarquee();
  initTilt();
  initClock();
  webglScene = initWebGL();
  ScrollTrigger.refresh();
}

BODY.classList.add('is-js', 'js-ready');
window.__booted = true;

try {
  boot();
} catch (err) {
  console.warn('Motion layer failed, falling back to static page:', err);
  BODY.classList.remove('js-ready');
  document.querySelectorAll('.reveal, .reveal-mask').forEach((el) => el.classList.add('is-in'));
}

/* Refresh after fonts load */
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
}
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  if (webglScene && IS_REDUCED) webglScene.render();
});
