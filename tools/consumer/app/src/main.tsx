// Touches every public entry point an app is likely to use first.
import '@aurum/react/aurum.css';
import { Button, Card, Glass, ListRow, ListSection, Menu, SegmentedControl, Sheet, Switch, setAurumPreferences, spring } from '@aurum/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

setAurumPreferences({ theme: 'dark' });

function App() {
  const [on, setOn] = useState(false);
  const [view, setView] = useState<'day' | 'week'>('day');
  return (
    <Glass style={{ padding: 'var(--space-16)', transitionDuration: `${spring.control.settleMs}ms` }}>
      <Card>
        <Button onClick={() => setOn(!on)}>Toggle</Button>
        <Switch checked={on} onCheckedChange={setOn} label="Wi-Fi" />
        <SegmentedControl
          aria-label="Range"
          value={view}
          onValueChange={setView}
          segments={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
          ]}
        />
        <Menu trigger={<Button>More</Button>} aria-label="More" items={[{ label: 'Rename', onSelect: () => {} }]} />
      </Card>
      <ListSection header="Account">
        <ListRow title="Name" value="Renz" />
      </ListSection>
      <Sheet open={false} onOpenChange={() => {}} title="Details">
        Body
      </Sheet>
    </Glass>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
