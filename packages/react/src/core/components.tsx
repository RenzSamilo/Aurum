import { type ComponentPropsWithoutRef, type ElementType, type ReactNode, useRef } from 'react';
import type { MaterialLevel } from '../tokens/tokens';
import { useSquircle } from '../squircle';

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
}: Polymorphic<T, { radius?: 'sm' | 'md' | 'lg' | 'xl' | (string & {}); children?: ReactNode }>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const value = ['sm', 'md', 'lg', 'xl'].includes(radius) ? `var(--radius-${radius})` : radius;
  useSquircle(ref, undefined, value);
  return (
    <Tag
      ref={ref}
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
  radius?: 'sm' | 'md' | 'lg' | 'xl' | (string & {});
  children?: ReactNode;
}

export function Glass<T extends ElementType = 'div'>({
  level = 'regular',
  className,
  ...rest
}: Polymorphic<T, GlassOwnProps>) {
  // Generic props cannot be checked through a second polymorphic component; they are the same shape.
  const props = rest as ComponentPropsWithoutRef<typeof Squircle>;
  return <Squircle {...props} className={['aurum-glass', className].filter(Boolean).join(' ')} data-level={level} />;
}
