import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import type { HapticIntent } from '../tokens/tokens.js';
export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
    /**
     * filled: the one main action. tinted / gray: secondary. plain: text only.
     * glass: clear glass, for a control floating over imagery, video or a busy background.
     */
    variant?: ButtonVariant;
    /** sm 32px tall (still a 44px hit area), md 48px, lg 64px. */
    size?: ButtonSize;
    /** Capsule ends instead of rounded corners. */
    capsule?: boolean;
    /** Uses the danger colour. Say what will be lost in the label. */
    destructive?: boolean;
    /** Icon before the label. Icon-only buttons need an aria-label. */
    icon?: ReactNode;
    fullWidth?: boolean;
    /** Haptic on press. Off by default: most buttons do not need one. */
    haptic?: HapticIntent | false;
    ref?: Ref<HTMLButtonElement>;
}
/**
 * A button. Presses scale down slightly with the control spring; with reduced
 * motion they only change colour.
 */
export declare function Button({ variant, size, capsule, destructive, icon, fullWidth, haptic, className, type, onClick, children, ...rest }: ButtonProps): import("react").JSX.Element;
export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange' | 'role'> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    /** Visible label. Clicking it toggles the switch. Without it, pass aria-label. */
    label?: ReactNode;
    /** Secondary line under the label. */
    description?: ReactNode;
    ref?: Ref<HTMLButtonElement>;
}
/**
 * An on/off switch for settings that apply immediately. Use a checkbox in
 * forms that are submitted later.
 */
export declare function Switch({ checked, onCheckedChange, label, description, className, disabled, id, ...rest }: SwitchProps): import("react").JSX.Element;
export interface Segment<T extends string> {
    value: T;
    label: ReactNode;
    /** Required when label is an icon. */
    ariaLabel?: string;
    disabled?: boolean;
}
export interface SegmentedControlProps<T extends string> extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
    segments: readonly Segment<T>[];
    value: T;
    onValueChange: (value: T) => void;
    /** Names the group for screen readers. */
    'aria-label': string;
    size?: 'sm' | 'md';
    /** A capsule of clear glass with a glass thumb, for a control floating over imagery or a busy background. */
    glass?: boolean;
}
/**
 * Two to five mutually exclusive options shown side by side, such as views of
 * the same content. Arrow keys move the selection, like native radio groups.
 */
export declare function SegmentedControl<T extends string>({ segments, value, onValueChange, size, glass, className, style, ...rest }: SegmentedControlProps<T>): import("react").JSX.Element;
