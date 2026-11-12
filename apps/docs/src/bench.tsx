// Glass performance bench: Aurum glass over a busy, animated WebGL canvas, the
// Keiz-HQ case (react-three-fiber on iPhone 11). Driven by tools/bench/glass.mjs.
//
//   glass-bench.html?mode=translucent | opaque | none&seconds=6
//
// translucent: the default glass. opaque: what "surfaces": { "material": "opaque" }
// (or the Solid surfaces setting) gives. none: the canvas alone, the baseline.
// Results land in window.__bench and in the page title.
import '@aurum/react/aurum.css';
import { Button, Card, Glass, SegmentedControl, setAurumPreferences, TabBar } from '@aurum/react';
import { ChartBar, Gear, House, Play, User } from '@phosphor-icons/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

const params = new URLSearchParams(location.search);
const mode = (params.get('mode') ?? 'translucent') as 'translucent' | 'opaque' | 'none';
const seconds = Number(params.get('seconds') ?? 6);
setAurumPreferences({ transparency: mode === 'opaque' ? 'reduced' : 'normal' });

// A full-screen fragment shader: moving bands, rings and noise, so every frame changes everywhere.
const FRAG = `precision mediump float;
uniform float t; uniform vec2 res;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  float bands = sin(uv.x * 40.0 + t * 3.0) * sin(uv.y * 30.0 - t * 2.0);
  float rings = sin(length(uv - vec2(0.5 + 0.3 * sin(t), 0.5)) * 60.0 - t * 6.0);
  vec3 c = 0.5 + 0.5 * cos(t + uv.xyx * 6.0 + vec3(0.0, 2.0, 4.0));
  c *= 0.6 + 0.4 * bands * rings;
  c += 0.15 * h(floor(gl_FragCoord.xy / 4.0) + floor(t * 30.0));
  gl_FragColor = vec4(c, 1.0);
}`;

function startCanvas(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false });
  if (!gl) throw new Error('WebGL unavailable');
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uT = gl.getUniformLocation(prog, 't');
  gl.uniform2f(gl.getUniformLocation(prog, 'res'), canvas.width, canvas.height);

  const frames: number[] = [];
  const t0 = performance.now();
  let last = t0;
  const frame = (now: number) => {
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (now - t0 > 1000) frames.push(now - last); // skip the first second (warm-up)
    last = now;
    if (now - t0 < (seconds + 1) * 1000) requestAnimationFrame(frame);
    else report(frames);
  };
  requestAnimationFrame(frame);
}

function report(frames: number[]) {
  const sorted = [...frames].sort((a, b) => a - b);
  const total = frames.reduce((a, b) => a + b, 0);
  const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
  const result = {
    mode,
    frames: frames.length,
    fps: +((frames.length * 1000) / total).toFixed(1),
    p50: +pct(0.5).toFixed(1),
    p95: +pct(0.95).toFixed(1),
    // A frame over 1.5x the 60 Hz budget is one the eye can catch.
    jank: +((frames.filter((f) => f > 25).length / frames.length) * 100).toFixed(1),
  };
  (window as unknown as { __bench: typeof result }).__bench = result;
  document.title = `bench ${JSON.stringify(result)}`;
  // Also on screen, for reading the result on a real phone.
  const out = document.createElement('pre');
  out.className = 'bench-result';
  out.textContent = `${result.mode}: ${result.fps} fps, median ${result.p50} ms, p95 ${result.p95} ms, jank ${result.jank}%`;
  document.body.appendChild(out);
}

function Overlay() {
  const [tab, setTab] = useState(0);
  const [speed, setSpeed] = useState<'1x' | '2x'>('1x');
  return (
    <div className="bench-overlay">
      <Glass level="regular" radius="lg" className="bench-top">
        <span className="aurum-type-headline">Keiz HQ</span>
        <Button variant="glass" capsule icon={<Gear />} aria-label="Settings" />
      </Glass>
      <div className="bench-middle">
        <Card material="thin" padding="md">
          <p className="aurum-type-card" style={{ margin: 0 }}>
            Scene
          </p>
          <p className="aurum-type-footnote" style={{ margin: 0 }}>
            Glass card over the canvas
          </p>
        </Card>
        <div className="bench-row">
          <Button variant="glass" capsule icon={<Play weight="fill" />}>
            Play
          </Button>
          <SegmentedControl
            aria-label="Speed"
            glass
            value={speed}
            onValueChange={setSpeed}
            segments={[
              { value: '1x', label: '1x' },
              { value: '2x', label: '2x' },
            ]}
          />
        </div>
      </div>
      <TabBar
        aria-label="Main"
        selectedIndex={tab}
        onSelectedChange={setTab}
        tabs={[
          { label: 'Home', icon: <House /> },
          { label: 'Stats', icon: <ChartBar /> },
          { label: 'Profile', icon: <User /> },
        ]}
      />
    </div>
  );
}

const css = document.createElement('style');
css.textContent = `
  html, body, #root { margin: 0; height: 100%; overflow: hidden; }
  canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; }
  .bench-overlay { position: fixed; inset: 0; display: flex; flex-direction: column; justify-content: space-between; }
  .bench-top { display: flex; align-items: center; justify-content: space-between; margin: var(--space-16); padding: var(--space-8) var(--space-8) var(--space-8) var(--space-16); }
  .bench-middle { display: grid; gap: var(--space-16); padding: var(--space-16); }
  .bench-row { display: flex; gap: var(--space-12); align-items: center; }
  .bench-overlay .aurum-tab-bar { position: static; }
  .bench-result { position: fixed; top: 40%; left: var(--space-16); right: var(--space-16); z-index: 10; margin: 0; padding: var(--space-16); white-space: pre-wrap; background: var(--color-surface-elevated); color: var(--color-text-primary); font: inherit; }
`;
document.head.appendChild(css);

const canvas = document.createElement('canvas');
document.body.prepend(canvas);
startCanvas(canvas);
if (mode !== 'none') createRoot(document.getElementById('root')!).render(<Overlay />);
