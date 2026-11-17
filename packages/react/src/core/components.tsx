import { type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode, useRef } from 'react';
import type { MaterialLevel } from '../tokens/tokens';
import { useSquircle } from '../squircle';
import { GlassLens } from '../lens';

type Polymorphic<T extends ElementType, P> = P & { as?: T } & Omit<ComponentPropsWithoutRef<T>, keyof P | 'as'>;

/**
 * A box with continuous corners in every browser. Set the radius with the
 * `radius` prop (a token name or any CSS length) or with CSS border-radius.
 */
export function Squircle<T extends ElementType = 'div'>({
  as,
  radius = 'lg',
  className,
  style,
  ...rest
}: Polymorphic<T, { radius?: 'sm' | 'md' | 'lg' | 'xl' | 'pill' | (string & {}); children?: ReactNode }>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const value = ['sm', 'md', 'lg', 'xl', 'pill'].includes(radius) ? `var(--radius-${radius})` : radius;
  useSquircle(ref, undefined, value);
  return (
    <Tag
      ref={ref}
      // A capsule keeps round ends (aurum.css); only rectangles get the superellipse.
      data-capsule={value === 'var(--radius-pill)' || undefined}
      className={['aurum-squircle', className].filter(Boolean).join(' ')}
      style={{ '--aurum-radius': value, ...style }}
      {...rest}
    />
  );
}

/**
 * A translucent material. It blurs what is behind it and turns solid when the
 * user reduces transparency. Use it for bars, sheets and floating controls,
 * not for content.
 */
/** Glass's own props; any prop of the rendered element (`as`) is also accepted. */
export interface GlassOwnProps {
  level?: MaterialLevel;
  /** A radius token (pill makes a capsule) or any CSS length. */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'pill' | (string & {});
  /** Mixed into the glass, e.g. 'var(--color-accent)' for a selected or primary control. */
  tint?: string;
  /** Light-catching rim and top sheen. Off leaves a flat hairline border. */
  rim?: boolean;
  /**
   * Bend the backdrop near the edge, like thick glass, instead of only blurring it.
   * Chromium only (Chrome, Edge, Android); Safari and Firefox keep plain glass.
   */
  lens?: boolean;
  children?: ReactNode;
}

export function Glass<T extends ElementType = 'div'>({
  level = 'regular',
  tint,
  rim = true,
  lens = false,
  className,
  children,
  ...rest
}: Polymorphic<T, GlassOwnProps>) {
  // Generic props cannot be checked through a second polymorphic component; they are the same shape.
  const { style, ...props } = rest as ComponentPropsWithoutRef<typeof Squircle> & { style?: CSSProperties };
  return (
    <Squircle
      {...props}
      className={['aurum-glass', className].filter(Boolean).join(' ')}
      data-level={level}
      data-rim={rim ? undefined : 'off'}
      data-tinted={tint ? true : undefined}
      style={tint ? { '--aurum-glass-tint-color': tint, ...style } : style}
    >
      {children}
      {lens && <GlassLens />}
    </Squircle>
  );
}
