import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Vector3,
} from 'three';

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

// Raymarched iridescent metaballs. One blob chases the cursor, the rest orbit.
const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;     // -1..1, smoothed
  uniform float uScroll;   // 0..1 progress through hero
  uniform vec3 uTint;

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float map(vec3 p) {
    float t = uTime * 0.35;
    float d = 1e5;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      vec3 c = vec3(
        sin(t * (0.6 + fi * 0.13) + fi * 1.7) * 1.25,
        cos(t * (0.5 + fi * 0.11) + fi * 2.3) * 0.75,
        sin(t * (0.4 + fi * 0.07) + fi) * 0.5
      );
      float r = 0.42 + 0.12 * sin(t * 1.3 + fi);
      d = smin(d, length(p - c) - r, 0.55);
    }
    vec3 m = vec3(uMouse.x * 2.2 * (uRes.x / uRes.y) * 0.55, uMouse.y * 1.25, 0.35);
    d = smin(d, length(p - m) - 0.33, 0.6);
    // subtle surface ripple
    d += 0.025 * sin(p.x * 7.0 + uTime) * sin(p.y * 6.0 - uTime * 0.8) * sin(p.z * 5.0);
    return d;
  }

  vec3 normal(vec3 p) {
    vec2 e = vec2(0.002, 0.0);
    return normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)
    ));
  }

  // cosine palette, thin-film iridescence
  vec3 pal(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
    vec3 ro = vec3(0.0, uScroll * 0.8, 4.2);
    vec3 rd = normalize(vec3(uv * 0.62, -1.6));

    float t = 0.0;
    float hit = 0.0;
    for (int i = 0; i < 64; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      if (d < 0.0015) { hit = 1.0; break; }
      t += d * 0.9;
      if (t > 9.0) break;
    }

    vec3 bg = vec3(0.02, 0.02, 0.035);
    // faint radial glow behind the blobs
    bg += uTint * 0.10 * smoothstep(1.8, 0.0, length(uv - vec2(uMouse.x * 0.3, uMouse.y * 0.2)));

    vec3 col = bg;
    if (hit > 0.5) {
      vec3 p = ro + rd * t;
      vec3 n = normal(p);
      vec3 v = -rd;
      float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
      vec3 l1 = normalize(vec3(0.6, 0.8, 0.6));
      vec3 l2 = normalize(vec3(-0.8, -0.3, 0.4));
      float diff = max(dot(n, l1), 0.0);
      float spec = pow(max(dot(reflect(-l1, n), v), 0.0), 48.0);
      float spec2 = pow(max(dot(reflect(-l2, n), v), 0.0), 24.0);
      vec3 film = pal(fres * 1.2 + dot(n, vec3(0.3, 0.5, 0.2)) + uTime * 0.04);
      col = mix(vec3(0.03, 0.03, 0.05), film, 0.18 + fres * 0.9);
      col += diff * 0.06 * uTint;
      col += spec * 1.1 + spec2 * film * 0.6;
      col = mix(col, bg, smoothstep(4.0, 7.0, t));
    }

    // vignette + grain
    col *= 1.0 - 0.35 * dot(vUv - 0.5, vUv - 0.5) * 2.0;
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.035;
    col *= 1.0 - uScroll * 0.7;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initHero(canvas: HTMLCanvasElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch {
    canvas.classList.add('no-webgl');
    return;
  }
  const coarse = matchMedia('(pointer: coarse)').matches;
  // Raymarching is fragment-heavy: render below native resolution and let CSS upscale.
  const scale = coarse ? 0.5 : 0.65;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * scale);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.35, 0.1) },
    uScroll: { value: 0 },
    uTint: { value: new Vector3(0.55, 0.35, 1.0) },
  };
  const mat = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  scene.add(new Mesh(new PlaneGeometry(2, 2), mat));

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  addEventListener('resize', resize);

  const target = new Vector2(0.35, 0.1);
  addEventListener('pointermove', (e) => {
    target.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const start = performance.now();
  const frame = () => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    uniforms.uTime.value = (performance.now() - start) / 1000;
    uniforms.uMouse.value.lerp(target, 0.06);
    uniforms.uScroll.value = Math.min(scrollY / innerHeight, 1);
    renderer.render(scene, camera);
  };
  if (reduce) {
    uniforms.uTime.value = 12;
    renderer.render(scene, camera);
  } else frame();
}
