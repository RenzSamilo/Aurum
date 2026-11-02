import { type AurumPreferences, haptic, material, radius, setAurumPreferences, spring, type, type SpringName } from '@aurum/react';
import { Barbell, BowlFood, Drop, Fire, Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const colorGroups: Record<string, string[]> = {
  Surface: ['surface-canvas', 'surface-card', 'surface-inset', 'surface-elevated'],
  Text: ['text-primary', 'text-secondary', 'text-tertiary'],
  Border: ['border-decorative', 'border-control'],
  Status: ['accent', 'on-accent', 'success', 'warning', 'danger'],
};

export function App() {
  const [prefs, setPrefs] = useState<AurumPreferences>({});
  useEffect(() => setAurumPreferences(prefs), [prefs]);
  const toggle = <K extends keyof AurumPreferences>(key: K, on: AurumPreferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: p[key] === on ? undefined : on }));

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <p className="aurum-type-footnote eyebrow">Phase 0 · token preview</p>
          <h1 className="aurum-type-display">Aurum</h1>
          <p className="aurum-type-body lede">
            One token source, two libraries. Every value on this page comes from <code>tokens/</code>; the Flutter example app reads
            the same file.
          </p>
        </div>
        <div className="toolbar" role="group" aria-label="Display preferences">
          <Toggle pressed={prefs.theme === 'dark'} onClick={() => toggle('theme', 'dark')}>
            {prefs.theme === 'dark' ? <Moon weight="bold" /> : <Sun weight="bold" />} Dark
          </Toggle>
          <Toggle pressed={prefs.contrast === 'more'} onClick={() => toggle('contrast', 'more')}>
            More contrast
          </Toggle>
          <Toggle pressed={prefs.transparency === 'reduced'} onClick={() => toggle('transparency', 'reduced')}>
            Solid surfaces
          </Toggle>
          <Toggle pressed={prefs.motion === 'reduced'} onClick={() => toggle('motion', 'reduced')}>
            Reduce motion
          </Toggle>
        </div>
      </header>

      <Section title="Colour" note="Semantic roles in OKLCH. Toggle dark and contrast above.">
        <div className="swatch-groups">
          {Object.entries(colorGroups).map(([group, names]) => (
            <div key={group} className="card aurum-squircle">
              <h3 className="aurum-type-headline">{group}</h3>
              <ul className="swatches">
                {names.map((n) => (
                  <li key={n}>
                    <span className="chip" style={{ background: `var(--color-${n})` }} />
                    <code className="aurum-type-footnote">--color-{n}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Inter Variable with optical sizing. Size / line height in px, tracking in em.">
        <div className="card aurum-squircle type-ramp">
          {Object.entries(type).map(([role, t]) => (
            <div key={role} className="type-row">
              <span className={`aurum-type-${role}`}>Log breakfast, 412 kcal</span>
              <code className="aurum-type-caption meta">
                {role} · {t.size}/{t.lineHeight} · {t.weight} · {t.tracking}em
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shape" note="Continuous corners where the browser supports corner-shape; nested radius = outer − padding.">
        <div className="radii">
          {Object.entries(radius)
            .filter(([k]) => k !== 'pill')
            .map(([k, r]) => (
              <div key={k} className="radius-demo aurum-squircle" style={{ ['--aurum-radius' as string]: `${r}px` }}>
                <div className="radius-inner aurum-squircle" style={{ ['--aurum-radius' as string]: `${Math.max(0, r - 12)}px` }} />
                <code className="aurum-type-caption">
                  {k} · {r}px
                </code>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Motion" note="Each spring is sampled into a CSS linear() curve at build time. Tap a row to run it.">
        <div className="card aurum-squircle springs">
          {(Object.keys(spring) as SpringName[]).map((name) => (
            <SpringRow key={name} name={name} />
          ))}
        </div>
      </Section>

      <Section title="Materials" note="Glass for floating controls only. Solid surfaces replaces it with an opaque fill.">
        <div className="material-stage aurum-squircle">
          {(Object.keys(material.blur) as (keyof typeof material.blur)[]).map((level) => (
            <div key={level} className="glass aurum-squircle" data-level={level}>
              <span className="aurum-type-subhead">{level}</span>
              <code className="aurum-type-caption">blur {material.blur[level]}px</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Haptics" note="By meaning. Flutter plays them natively; on the web they are opt-in.">
        <div className="card aurum-squircle">
          <table className="haptics aurum-type-footnote">
            <thead>
              <tr>
                <th>Intent</th>
                <th>Flutter</th>
                <th>Android web (ms)</th>
                <th>iPhone web</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(haptic).map(([k, h]) => (
                <tr key={k}>
                  <td>
                    <code>{k}</code>
                  </td>
                  <td>{h.flutter}</td>
                  <td className="aurum-numeric">{h.web.length ? h.web.join(', ') : 'none'}</td>
                  <td>{h.iosWeb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Icons" note="Phosphor (MIT). Weight follows the text weight next to it.">
        <div className="card aurum-squircle icons">
          {[BowlFood, Barbell, Drop, Fire].map((Icon, i) => (
            <span key={i} className="icon-row">
              <Icon size={24} weight="regular" />
              <Icon size={24} weight="bold" />
              <Icon size={24} weight="fill" />
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2 className="aurum-type-section">{title}</h2>
      <p className="aurum-type-subhead note">{note}</p>
      {children}
    </section>
  );
}

function Toggle({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="toggle aurum-type-subhead" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

function SpringRow({ name }: { name: SpringName }) {
  const [on, setOn] = useState(false);
  const s = spring[name];
  return (
    <button type="button" className="spring-row" onClick={() => setOn((v) => !v)} aria-pressed={on}>
      <span className="spring-label">
        <span className="aurum-type-headline">{name}</span>
        <code className="aurum-type-caption meta">
          {s.stiffness}/{s.damping} · {s.duration.toFixed(2)}s · bounce {s.bounce.toFixed(2)}
        </code>
      </span>
      <span className="track">
        <span
          className="dot"
          style={{
            transform: on ? 'translateX(calc(100cqi - 100%))' : 'translateX(0)',
            transitionTimingFunction: `var(--spring-${name}-easing)`,
            transitionDuration: `var(--spring-${name}-duration)`,
          }}
        />
      </span>
    </button>
  );
}
