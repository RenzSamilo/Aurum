import { type ComponentPropsWithoutRef, type Ref, useState } from 'react';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------
// Avatar

/** Up to two initials: first letters of the first and last words. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ? [...words[0]][0] : '';
  const last = words.length > 1 ? [...(words.at(-1) ?? '')][0] : '';
  return `${first ?? ''}${last ?? ''}`.toUpperCase();
}

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** Read by screen readers, and the source of the initials. */
  name: string;
  /** Picture URL. Falls back to initials if it is missing or fails to load. */
  src?: string;
  /** Diameter in px. */
  size?: number;
  /** A ring in the card colour, for avatars that sit on photos or tints. */
  ring?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

/** A round picture of a person or thing. Without a picture, it shows initials on an accent tint. */
export function Avatar({ name, src, size = 40, ring = false, className, style, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = src && failed !== src;
  const role = size >= 64 ? 'section' : size >= 40 ? 'headline' : 'caption';
  return (
    <span
      role="img"
      aria-label={name}
      className={cx('aurum-avatar', className)}
      data-ring={ring ? (size >= 64 ? 'thick' : 'thin') : undefined}
      data-type={role}
      style={{ '--aurum-avatar-size': `${size}px`, ...style }}
      {...rest}
    >
      {showImage ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Badge

export type BadgeTone = 'accent' | 'secondary' | 'neutral' | 'danger';
/** soft: tinted fill. solid: full colour, for the one badge that must pop. outline: hairline border. */
export type BadgeAppearance = 'soft' | 'solid' | 'outline';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: BadgeTone;
  appearance?: BadgeAppearance;
  ref?: Ref<HTMLSpanElement>;
}

/** A small status label, such as "New", "Pro" or "Free". */
export function Badge({ tone = 'accent', appearance = 'soft', className, ...rest }: BadgeProps) {
  return <span className={cx('aurum-badge', className)} data-tone={tone} data-appearance={appearance} {...rest} />;
}
