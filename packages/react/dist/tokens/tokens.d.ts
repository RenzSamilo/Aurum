export declare const brandName = "Aurum";
export declare const space: {
    readonly "2": 2;
    readonly "4": 4;
    readonly "8": 8;
    readonly "12": 12;
    readonly "16": 16;
    readonly "24": 24;
    readonly "32": 32;
    readonly "48": 48;
    readonly "64": 64;
};
export declare const radius: {
    readonly sm: 12;
    readonly md: 18;
    readonly lg: 24;
    readonly xl: 32;
    readonly pill: 999;
};
export declare const shapeSmoothing = 0.6;
export declare const size: {
    readonly target: 48;
    readonly targetLarge: 64;
    readonly iconSm: 20;
    readonly iconMd: 24;
    readonly iconLg: 28;
    readonly focusWidth: 2;
    readonly focusOffset: 2;
    readonly gutterPhone: 16;
    readonly gutterTablet: 24;
    readonly gutterDesktop: 32;
};
export declare const z: {
    readonly content: 0;
    readonly navigation: 10;
    readonly popover: 20;
    readonly scrim: 30;
    readonly modal: 40;
    readonly toast: 50;
};
export declare const font: {
    readonly ui: "Inter";
    readonly mono: "Geist Mono";
    readonly display: "Fraunces";
};
/** Text roles: px at a 16px root, variable weight, tracking in em. */
export declare const type: {
    readonly display: {
        readonly size: 40;
        readonly lineHeight: 48;
        readonly weight: 560;
        readonly tracking: -0.01;
    };
    readonly page: {
        readonly size: 32;
        readonly lineHeight: 40;
        readonly weight: 560;
        readonly tracking: -0.01;
    };
    readonly section: {
        readonly size: 24;
        readonly lineHeight: 32;
        readonly weight: 560;
        readonly tracking: -0.01;
    };
    readonly card: {
        readonly size: 20;
        readonly lineHeight: 28;
        readonly weight: 560;
        readonly tracking: -0.01;
    };
    readonly headline: {
        readonly size: 17;
        readonly lineHeight: 24;
        readonly weight: 600;
        readonly tracking: -0.005;
    };
    readonly body: {
        readonly size: 17;
        readonly lineHeight: 24;
        readonly weight: 400;
        readonly tracking: -0.005;
    };
    readonly callout: {
        readonly size: 16;
        readonly lineHeight: 24;
        readonly weight: 500;
        readonly tracking: 0;
    };
    readonly subhead: {
        readonly size: 15;
        readonly lineHeight: 22;
        readonly weight: 500;
        readonly tracking: 0;
    };
    readonly footnote: {
        readonly size: 14;
        readonly lineHeight: 20;
        readonly weight: 400;
        readonly tracking: 0.005;
    };
    readonly caption: {
        readonly size: 12;
        readonly lineHeight: 16;
        readonly weight: 500;
        readonly tracking: 0.01;
    };
    readonly micro: {
        readonly size: 11;
        readonly lineHeight: 16;
        readonly weight: 500;
        readonly tracking: 0.015;
    };
};
export type TypeRole = keyof typeof type;
/** Durations in ms. */
export declare const duration: {
    readonly press: 80;
    readonly hover: 120;
    readonly feedback: 160;
    readonly transition: 240;
    readonly presentation: 320;
    readonly reducedFade: 150;
};
export declare const easeStandard: readonly [0.2, 0, 0, 1];
/**
 * Springs. Use mass/stiffness/damping with Motion for anything a gesture can
 * interrupt (keeps velocity). duration/bounce match SwiftUI and Flutter.
 */
export declare const spring: {
    readonly control: {
        readonly mass: 1;
        readonly stiffness: 400;
        readonly damping: 36;
        readonly dampingRatio: 0.9;
        readonly duration: 0.3142;
        readonly bounce: 0.1;
        readonly settleMs: 419;
    };
    readonly surface: {
        readonly mass: 1;
        readonly stiffness: 240;
        readonly damping: 30;
        readonly dampingRatio: 0.9682;
        readonly duration: 0.4056;
        readonly bounce: 0.0318;
        readonly settleMs: 533;
    };
    readonly reward: {
        readonly mass: 1;
        readonly stiffness: 300;
        readonly damping: 24;
        readonly dampingRatio: 0.6928;
        readonly duration: 0.3628;
        readonly bounce: 0.3072;
        readonly settleMs: 597;
    };
};
export type SpringName = keyof typeof spring;
export declare const press: {
    readonly scaleControl: 0.97;
    readonly scaleCard: 0.99;
};
export declare const gesture: {
    readonly rubberBandLimit: 80;
    readonly projectionDeceleration: 0.998;
};
export declare const material: {
    readonly blur: {
        readonly clear: 12;
        readonly ultralight: 8;
        readonly thin: 16;
        readonly regular: 24;
        readonly thick: 32;
    };
    readonly saturation: {
        readonly clear: 1.6;
        readonly ultralight: 1.1;
        readonly thin: 1.1;
        readonly regular: 1.1;
        readonly thick: 1;
    };
};
export type MaterialLevel = keyof typeof material.blur;
/** Haptic intents. web = optional Android vibration pattern (ms); iosWeb = optional ios-haptics call. */
export declare const haptic: {
    readonly selectionTick: {
        readonly flutter: "selection";
        readonly web: readonly [8];
        readonly iosWeb: "haptic";
    };
    readonly selectionFrequent: {
        readonly flutter: "selection";
        readonly web: readonly [];
        readonly iosWeb: "none";
        readonly throttleMs: 50;
    };
    readonly impactLight: {
        readonly flutter: "light";
        readonly web: readonly [8];
        readonly iosWeb: "haptic";
    };
    readonly impactMedium: {
        readonly flutter: "medium";
        readonly web: readonly [12];
        readonly iosWeb: "haptic";
    };
    readonly impactHeavy: {
        readonly flutter: "heavy";
        readonly web: readonly [];
        readonly iosWeb: "none";
    };
    readonly impactSoft: {
        readonly flutter: "soft";
        readonly web: readonly [];
        readonly iosWeb: "none";
    };
    readonly impactRigid: {
        readonly flutter: "rigid";
        readonly web: readonly [];
        readonly iosWeb: "none";
    };
    readonly resultSuccess: {
        readonly flutter: "success";
        readonly web: readonly [12];
        readonly iosWeb: "confirm";
    };
    readonly resultWarning: {
        readonly flutter: "warning";
        readonly web: readonly [];
        readonly iosWeb: "none";
    };
    readonly resultError: {
        readonly flutter: "error";
        readonly web: readonly [20, 40, 20];
        readonly iosWeb: "error";
    };
};
export type HapticIntent = keyof typeof haptic;
/** Semantic colours per mode, as CSS colour strings. Prefer the CSS variables in components. */
export declare const color: {
    readonly light: {
        readonly surfaceCanvas: "oklch(0.98 0.013 88)";
        readonly surfaceCard: "oklch(0.99 0.011 88)";
        readonly surfaceInset: "oklch(0.96 0.013 88)";
        readonly surfaceElevated: "oklch(0.99 0.011 88)";
        readonly textPrimary: "oklch(0.22 0.033 160)";
        readonly textSecondary: "oklch(0.44 0.044 160)";
        readonly textTertiary: "oklch(0.5 0.033 160)";
        readonly borderDecorative: "oklch(0.88 0.018 88)";
        readonly borderControl: "oklch(0.6 0.033 160)";
        readonly accent: "oklch(0.42 0.06 152)";
        readonly accentSecondary: "oklch(0.5 0.09 85)";
        readonly onAccent: "oklch(0.99 0.011 88)";
        readonly danger: "oklch(0.48 0.17 28)";
        readonly warning: "oklch(0.5 0.1 70)";
        readonly success: "oklch(0.42 0.06 152)";
        readonly fillHover: "rgb(0 0 0 / 0.04)";
        readonly fillPressed: "rgb(0 0 0 / 0.06)";
        readonly focus: "oklch(0.42 0.06 152)";
        readonly scrim: "rgb(0 0 0 / 0.32)";
    };
    readonly dark: {
        readonly surfaceCanvas: "oklch(0.16 0.018 160)";
        readonly surfaceCard: "oklch(0.2 0.022 160)";
        readonly surfaceInset: "oklch(0.24 0.026 160)";
        readonly surfaceElevated: "oklch(0.28 0.026 160)";
        readonly textPrimary: "oklch(0.96 0.013 88)";
        readonly textSecondary: "oklch(0.78 0.031 160)";
        readonly textTertiary: "oklch(0.7 0.031 160)";
        readonly borderDecorative: "oklch(0.32 0.026 160)";
        readonly borderControl: "oklch(0.6 0.033 160)";
        readonly accent: "oklch(0.74 0.045 152)";
        readonly accentSecondary: "oklch(0.82 0.09 85)";
        readonly onAccent: "oklch(0.15 0.033 160)";
        readonly danger: "oklch(0.78 0.12 28)";
        readonly warning: "oklch(0.82 0.1 80)";
        readonly success: "oklch(0.74 0.045 152)";
        readonly fillHover: "rgb(255 255 255 / 0.05)";
        readonly fillPressed: "rgb(255 255 255 / 0.08)";
        readonly focus: "oklch(0.74 0.045 152)";
        readonly scrim: "rgb(0 0 0 / 0.48)";
    };
    readonly contrastLight: {
        readonly surfaceCanvas: "oklch(0.98 0.013 88)";
        readonly surfaceCard: "oklch(0.99 0.011 88)";
        readonly surfaceInset: "oklch(0.96 0.013 88)";
        readonly surfaceElevated: "oklch(0.99 0.011 88)";
        readonly textPrimary: "oklch(0.22 0.033 160)";
        readonly textSecondary: "oklch(0.36 0.044 160)";
        readonly textTertiary: "oklch(0.4 0.033 160)";
        readonly borderDecorative: "oklch(0.88 0.018 88)";
        readonly borderControl: "oklch(0.5 0.033 160)";
        readonly accent: "oklch(0.42 0.06 152)";
        readonly accentSecondary: "oklch(0.5 0.09 85)";
        readonly onAccent: "oklch(0.99 0.011 88)";
        readonly danger: "oklch(0.48 0.17 28)";
        readonly warning: "oklch(0.5 0.1 70)";
        readonly success: "oklch(0.42 0.06 152)";
        readonly fillHover: "rgb(0 0 0 / 0.04)";
        readonly fillPressed: "rgb(0 0 0 / 0.06)";
        readonly focus: "oklch(0.42 0.06 152)";
        readonly scrim: "rgb(0 0 0 / 0.32)";
    };
    readonly contrastDark: {
        readonly surfaceCanvas: "oklch(0.16 0.018 160)";
        readonly surfaceCard: "oklch(0.2 0.022 160)";
        readonly surfaceInset: "oklch(0.24 0.026 160)";
        readonly surfaceElevated: "oklch(0.28 0.026 160)";
        readonly textPrimary: "oklch(0.96 0.013 88)";
        readonly textSecondary: "oklch(0.86 0.031 160)";
        readonly textTertiary: "oklch(0.8 0.031 160)";
        readonly borderDecorative: "oklch(0.32 0.026 160)";
        readonly borderControl: "oklch(0.72 0.033 160)";
        readonly accent: "oklch(0.74 0.045 152)";
        readonly accentSecondary: "oklch(0.82 0.09 85)";
        readonly onAccent: "oklch(0.15 0.033 160)";
        readonly danger: "oklch(0.78 0.12 28)";
        readonly warning: "oklch(0.82 0.1 80)";
        readonly success: "oklch(0.74 0.045 152)";
        readonly fillHover: "rgb(255 255 255 / 0.05)";
        readonly fillPressed: "rgb(255 255 255 / 0.08)";
        readonly focus: "oklch(0.74 0.045 152)";
        readonly scrim: "rgb(0 0 0 / 0.48)";
    };
};
export type ColorMode = keyof typeof color;
