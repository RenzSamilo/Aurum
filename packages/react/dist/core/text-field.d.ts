import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
export interface TextFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'size' | 'value' | 'defaultValue' | 'children' | 'aria-label'> {
    /** What the field is for. Screen readers read it; the placeholder is only a hint. */
    label: string;
    /** Controlled text. Leave it out (or use defaultValue) to let the field keep its own. */
    value?: string;
    defaultValue?: string;
    /** An icon or control at the start, e.g. a search glass. */
    leading?: ReactNode;
    /** An action at the end, e.g. a send button. */
    trailing?: ReactNode;
    onValueChange?: (value: string) => void;
    /** Enter in a one-line field; Cmd/Ctrl+Enter in a multi-line one. */
    onValueSubmit?: (value: string) => void;
    /** More than 1 makes a text area that grows up to this many lines. */
    maxLines?: number;
    /** Fully rounded ends, e.g. for a chat composer or search field. */
    capsule?: boolean;
    ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}
/**
 * A single or multi-line text input on an inset fill with continuous corners.
 * Put an action, such as a send button, in `trailing`.
 */
export declare function TextField({ label, value, defaultValue, leading, trailing, onValueChange, onValueSubmit, maxLines, capsule, disabled, className, style, ref, onKeyDown, ...rest }: TextFieldProps): import("react").JSX.Element;
