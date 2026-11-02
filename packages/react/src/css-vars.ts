import 'react';

// Lets components set CSS custom properties in style={{ '--name': value }}.
declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
