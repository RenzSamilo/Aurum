import { type AurumPreferences, Avatar, BackButton, Badge, Button, Card, Glass, ListRow, ListSection, Menu, ProgressRing, Sheet, SegmentedControl, Switch, TabBar, TextField, TopBar, type HapticIntent, haptic, material, playHaptic, radius, setAurumPreferences, spring, type, type SpringName } from '@aurum/react';
import { Archive, Barbell, Bell, ChartBar, CopySimple, DotsThree, Gear, Globe, Heart, House, Lock, MagnifyingGlass, Moon, PaperPlaneRight, PencilSimple, Play, Plus, Sun, Trash, User, WifiHigh } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const colorGroups: Record<string, string[]> = {
  Surface: ['surface-canvas', 'surface-card', 'surface-inset', 'surface-elevated'],
  Text: ['text-primary', 'text-secondary', 'text-tertiary'],
  Border: ['border-decorative', 'border-control'],
  Status: ['accent', 'accent-secondary', 'on-accent', 'success', 'warning', 'danger'],
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
          <p className="aurum-type-footnote eyebrow">Token preview</p>
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

      <Controls />
      <Surfaces />
      <AppParts />
      <GlassControls />

      <Section title="Colour" note="Semantic roles in OKLCH. Toggle dark and contrast above.">
        <div className="swatch-groups">
          {Object.entries(colorGroups).map(([group, names]) => (
            <div key={group} className="card aurum-squircle">
              <h3 className="aurum-type-headline">{group}</h3>
              <ul className="swatches">
                {names.map((n) => (
                  <li key={n}>
                    <span className="chip aurum-squircle" style={{ background: `var(--color-${n})`, ["--aurum-radius" as string]: "var(--radius-sm)" }} />
                    <code className="aurum-type-footnote">--color-{n}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Fraunces for titles, Inter for everything else; both with optical sizing. Size / line height in px, tracking in em.">
        <div className="card aurum-squircle type-ramp">
          {Object.entries(type).map(([role, t]) => (
            <div key={role} className="type-row">
              <span className={`aurum-type-${role}`}>Quarterly review, 3 of 12 done</span>
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
            <Glass key={level} className="glass" level={level} radius="md">
              <span className="aurum-type-subhead">{level}</span>
              <code className="aurum-type-caption">blur {material.blur[level]}px</code>
            </Glass>
          ))}
        </div>
      </Section>

      <Section title="Haptics" note="By meaning. Tap Play on an Android phone or an iPhone (Safari 18+) to feel each one.">
        <div className="card aurum-squircle">
          <table className="haptics aurum-type-footnote">
            <thead>
              <tr>
                <th>Intent</th>
                <th>Flutter</th>
                <th>Android web (ms)</th>
                <th>iPhone web</th>
                <th>
                  <span className="visually-hidden">Try it</span>
                </th>
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
                  <td>
                    <button type="button" className="toggle" onClick={() => playHaptic(k as HapticIntent)}>
                      Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Icons" note="Phosphor (MIT). Weight follows the text weight next to it.">
        <div className="card aurum-squircle icons">
          {[House, MagnifyingGlass, Bell, Gear].map((Icon, i) => (
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

function Controls() {
  const [notify, setNotify] = useState(true);
  const [sync, setSync] = useState(false);
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [view, setView] = useState<'list' | 'grid'>('list');
  return (
    <Section title="Controls" note="Press and hold to feel the spring. Every control works with a keyboard and a screen reader.">
      <div className="controls-grid">
        <div className="card aurum-squircle control-stack">
          <h3 className="aurum-type-headline">Button</h3>
          <div className="control-row">
            <Button>Continue</Button>
            <Button variant="tinted">Share</Button>
            <Button variant="gray">Cancel</Button>
            <Button variant="plain">Learn more</Button>
          </div>
          <div className="control-row">
            <Button size="sm" capsule icon={<Plus weight="bold" />}>
              New
            </Button>
            <Button size="sm" variant="tinted" capsule>
              Edit
            </Button>
            <Button variant="tinted" destructive icon={<Trash />}>
              Delete
            </Button>
            <Button variant="gray" icon={<Gear />} aria-label="Settings" />
            <Button disabled>Disabled</Button>
          </div>
          <Button size="lg" fullWidth haptic="impactMedium">
            Get started
          </Button>
        </div>
        <div className="card aurum-squircle control-stack">
          <h3 className="aurum-type-headline">Switch</h3>
          <Switch checked={notify} onCheckedChange={setNotify} label="Notifications" description="A summary each morning" />
          <Switch checked={sync} onCheckedChange={setSync} label="Sync over mobile data" />
          <Switch checked={false} onCheckedChange={() => {}} label="Requires an account" disabled />
          <h3 className="aurum-type-headline">Segmented control</h3>
          <SegmentedControl
            aria-label="Range"
            value={range}
            onValueChange={setRange}
            segments={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
          />
          <SegmentedControl
            aria-label="Layout"
            size="sm"
            style={{ width: 'fit-content' }}
            value={view}
            onValueChange={setView}
            segments={[
              { value: 'list', label: 'List' },
              { value: 'grid', label: 'Grid' },
            ]}
          />
          <h3 className="aurum-type-headline">Menu</h3>
          <p className="aurum-type-footnote">Arrow keys move, letters jump (type-to-select borrowed from Astryx), Escape closes.</p>
          <div className="control-row">
            <Menu
              trigger="Sort"
              items={[
                { label: 'Name', onSelect: () => {} },
                { label: 'Date added', onSelect: () => {} },
                { label: 'Size', onSelect: () => {} },
              ]}
            />
            <Menu
              trigger={<DotsThree weight="bold" />}
              aria-label="More actions"
              items={[
                { label: 'Rename', icon: <PencilSimple />, onSelect: () => {} },
                { label: 'Duplicate', icon: <CopySimple />, onSelect: () => {} },
                { label: 'Archive', icon: <Archive />, onSelect: () => {}, disabled: true },
                { label: 'Delete', icon: <Trash />, onSelect: () => {}, destructive: true },
              ]}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Surfaces() {
  const [sheet, setSheet] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [presses, setPresses] = useState(0);
  return (
    <Section title="Lists, cards and sheets" note="Grouped rows with inset separators, cards that press, and a sheet you can drag down to close.">
      <div className="controls-grid">
        <div className="control-stack">
          <ListSection header="Account" footer="Changes sync to every device you sign in on.">
            <ListRow leading={<Globe />} title="Language" value="English" onPress={() => setSheet(true)} />
            <ListRow leading={<Lock />} title="Privacy" subtitle="Who can see your profile" href="#privacy" />
            <ListRow
              leading={<WifiHigh />}
              title="Download over Wi-Fi only"
              trailing={<Switch checked={wifi} onCheckedChange={setWifi} aria-label="Download over Wi-Fi only" />}
            />
            <ListRow leading={<Bell />} title="Version" value="1.0.0" />
          </ListSection>
          <ListSection>
            <ListRow title="Sign out" destructive chevron={false} onPress={() => {}} />
          </ListSection>
        </div>
        <div className="control-stack">
          <Card>
            <p className="aurum-type-footnote meta" style={{ margin: 0 }}>
              Static card
            </p>
            <p className="aurum-type-card" style={{ margin: 'var(--space-4) 0 0' }}>
              Quarterly review
            </p>
            <p className="aurum-type-body" style={{ margin: 'var(--space-4) 0 0', color: 'var(--color-text-secondary)' }}>
              3 of 12 items done
            </p>
          </Card>
          <Card onPress={() => setPresses((n) => n + 1)} aria-label={`Pressable card, pressed ${presses} times`}>
            <p className="aurum-type-card" style={{ margin: 0 }}>
              Pressable card
            </p>
            <p className="aurum-type-body aurum-numeric" style={{ margin: 'var(--space-4) 0 0', color: 'var(--color-text-secondary)' }}>
              Pressed {presses} times
            </p>
          </Card>
          <Button variant="tinted" onClick={() => setSheet(true)}>
            Open sheet
          </Button>
        </div>
      </div>
      <Sheet open={sheet} onOpenChange={setSheet} title="Language">
        <ListSection>
          {['English', 'Filipino', 'Español', 'Deutsch', '日本語'].map((l) => (
            <ListRow key={l} title={l} chevron={false} onPress={() => setSheet(false)} />
          ))}
        </ListSection>
      </Sheet>
    </Section>
  );
}

function AppParts() {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];
  return (
    <Section title="Fields, navigation and identity" note="Top bar, text field, avatar, badge, progress ring and a glass tab bar that sticks to the bottom of its screen.">
      <div className="controls-grid">
        <div className="phone aurum-squircle">
          <div className="phone-scroll">
            <TopBar
              leading={<BackButton onClick={() => setTab(0)} />}
              title="Training"
              trailing={<Button variant="gray" capsule icon={<Plus weight="bold" />} aria-label="New workout" />}
            />
            <div className="control-stack phone-body">
              <TextField label="Search workouts" placeholder="Search" capsule leading={<MagnifyingGlass />} value={query} onValueChange={setQuery} />
              <Card padding="md">
                <div className="part-row">
                  <ProgressRing value={0.5} size={56} stroke={5} aria-label="Today's sets">
                    <span className="aurum-type-caption">3/6</span>
                  </ProgressRing>
                  <div>
                    <p className="aurum-type-headline" style={{ margin: 0 }}>
                      Push day <Badge>New</Badge>
                    </p>
                    <p className="aurum-type-footnote meta" style={{ margin: 0 }}>
                      3 of 6 sets done
                    </p>
                  </div>
                </div>
              </Card>
              <ListSection header="Training partners">
                {people.map((p, i) => (
                  <ListRow
                    key={p}
                    leading={<Avatar name={p} size={32} />}
                    title={p}
                    trailing={i === 0 ? <Badge tone="secondary">Coach</Badge> : i === 2 ? <Badge appearance="outline">Away</Badge> : undefined}
                  />
                ))}
              </ListSection>
              <div className="part-row">
                <Avatar name="Renz" size={64} ring />
                <Avatar name="Grace Hopper" size={40} />
                <Avatar name="Alan Turing" size={24} />
                <Badge tone="danger" appearance="solid">
                  Live
                </Badge>
                <Badge tone="neutral">Free</Badge>
                <ProgressRing value={0.8} color="var(--color-success)" aria-label="Weekly goal" />
              </div>
              <TextField
                label="Message"
                placeholder="Message your coach"
                maxLines={4}
                value={message}
                onValueChange={setMessage}
                onValueSubmit={() => setMessage('')}
                trailing={<Button size="sm" capsule icon={<PaperPlaneRight weight="fill" />} aria-label="Send" disabled={!message} />}
              />
            </div>
            <TabBar
              aria-label="Main"
              selectedIndex={tab}
              onSelectedChange={setTab}
              tabs={[
                { label: 'Today', icon: <House />, selectedIcon: <House weight="fill" /> },
                { label: 'Train', icon: <Barbell />, selectedIcon: <Barbell weight="fill" /> },
                { label: 'Progress', icon: <ChartBar />, selectedIcon: <ChartBar weight="fill" /> },
                { label: 'Profile', icon: <User />, selectedIcon: <User weight="fill" /> },
              ]}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function GlassControls() {
  const [speed, setSpeed] = useState<'1x' | '1.5x' | '2x'>('1x');
  return (
    <Section title="Glass controls" note="Clear-glass button, segmented track and glass card, for controls that float over imagery, video or a canvas.">
      <div className="glass-stage aurum-squircle">
        <div className="control-row">
          <Button variant="glass" capsule icon={<Play weight="fill" />}>
            Play
          </Button>
          <Button variant="glass" capsule icon={<Heart />} aria-label="Like" />
          <Button variant="glass" capsule destructive>
            Stop
          </Button>
        </div>
        <SegmentedControl
          aria-label="Playback speed"
          glass
          style={{ width: 'fit-content' }}
          value={speed}
          onValueChange={setSpeed}
          segments={[
            { value: '1x', label: '1x' },
            { value: '1.5x', label: '1.5x' },
            { value: '2x', label: '2x' },
          ]}
        />
        <Card material="thin" padding="md">
          <p className="aurum-type-card" style={{ margin: 0 }}>
            Glass card
          </p>
          <p className="aurum-type-footnote" style={{ margin: 'var(--space-4) 0 0' }}>
            material="thin". Toggle Solid surfaces above to see the fallback.
          </p>
        </Card>
        <Glass level="thin" radius="md" tint="var(--color-accent)" className="glass-tinted">
          <span className="aurum-type-subhead">Tinted glass</span>
        </Glass>
      </div>
    </Section>
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
