import 'package:flutter/material.dart';

import '../foundations/aurum_glass.dart';
import '../controls/aurum_pressable.dart';
import '../foundations/aurum_haptics.dart';
import '../foundations/aurum_springs.dart';
import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// One destination in an [AurumTabBar].
@immutable
class AurumTab {
  const AurumTab({required this.icon, required this.label, this.selectedIcon, this.child});

  final IconData icon;

  /// Shown when selected, usually the filled version of [icon].
  final IconData? selectedIcon;
  final String label;

  /// Replaces the icon, e.g. an AurumAvatar for a Profile tab.
  final Widget? child;
}

/// Bottom navigation between 2 to 5 top-level screens, on a glass material.
/// Place it in `Scaffold.bottomNavigationBar`; it pads for the home indicator.
class AurumTabBar extends StatelessWidget {
  const AurumTabBar({super.key, required this.tabs, required this.selectedIndex, required this.onSelected, this.solid})
    : assert(tabs.length >= 2 && tabs.length <= 5, 'Use 2 to 5 tabs.');

  final List<AurumTab> tabs;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  /// Forwarded to [AurumGlass.solid].
  final bool? solid;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return AurumGlass(
      level: AurumMaterialLevel.thick,
      radius: 0,
      solid: solid,
      child: Padding(
        padding: EdgeInsets.only(bottom: bottom),
        child: Row(
          children: [
            for (var i = 0; i < tabs.length; i++)
              Expanded(
                child: _TabButton(
                  tab: tabs[i],
                  selected: i == selectedIndex,
                  index: i,
                  count: tabs.length,
                  colors: c,
                  onTap: () {
                    if (i != selectedIndex) AurumHaptics.play(AurumHaptic.selectionTick);
                    onSelected(i);
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _TabButton extends StatefulWidget {
  const _TabButton({
    required this.tab,
    required this.selected,
    required this.index,
    required this.count,
    required this.colors,
    required this.onTap,
  });

  final AurumTab tab;
  final bool selected;
  final int index;
  final int count;
  final AurumColors colors;
  final VoidCallback onTap;

  @override
  State<_TabButton> createState() => _TabButtonState();
}

class _TabButtonState extends State<_TabButton> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final _TabButton(:tab, :selected, :index, :count, :colors, :onTap) = widget;
    final color = selected ? colors.accent : colors.textSecondary;
    final label = context
        .aurumText(AurumType.micro, color: color)
        .copyWith(
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          fontVariations: [FontVariation('wght', selected ? 600 : 500), const FontVariation('opsz', 11)],
        );
    return Semantics(
      container: true,
      button: true,
      selected: selected,
      label: tab.label,
      hint: 'Tab ${index + 1} of $count',
      onTap: onTap,
      excludeSemantics: true,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => onTap())},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          // Focus ring, separate from selection, so keyboard users see where Enter goes.
          child: DecoratedBox(
            position: DecorationPosition.foreground,
            decoration: ShapeDecoration(
              shape: RoundedSuperellipseBorder(
                borderRadius: BorderRadius.circular(context.aurumRadii.sm),
                side: _focused ? BorderSide(color: colors.focus, width: AurumSize.focusWidth) : BorderSide.none,
              ),
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 56),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AurumSpace.s8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      height: AurumSize.iconMd,
                      child: Center(
                        child:
                            tab.child ??
                            Icon(
                              selected ? (tab.selectedIcon ?? tab.icon) : tab.icon,
                              size: AurumSize.iconMd,
                              color: color,
                            ),
                      ),
                    ),
                    const SizedBox(height: AurumSpace.s2),
                    Text(tab.label, style: label, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A separate round glass button beside an [AurumFloatingTabBar], for one
/// action that is not a destination, such as search or compose.
@immutable
class AurumTabBarAction {
  const AurumTabBarAction({required this.icon, required this.semanticLabel, required this.onPressed});

  final IconData icon;
  final String semanticLabel;
  final VoidCallback onPressed;
}

/// Bottom navigation that floats over content: a capsule of glass, inset from
/// the screen edges, with a glass bubble that slides to the selected tab.
/// Icons only; each tab's [AurumTab.label] is read by screen readers.
///
/// Place it in `Scaffold.bottomNavigationBar` with `extendBody: true` so
/// content scrolls under the glass; it pads for the home indicator. Give the
/// scrolling content [AurumFloatingTabBar.height] of bottom padding.
class AurumFloatingTabBar extends StatelessWidget {
  const AurumFloatingTabBar({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onSelected,
    this.action,
    this.solid,
  }) : assert(tabs.length >= 2 && tabs.length <= 5, 'Use 2 to 5 tabs.');

  final List<AurumTab> tabs;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final AurumTabBarAction? action;

  /// Forwarded to [AurumGlass.solid].
  final bool? solid;

  static const double _bar = 64;
  static const double _tab = 56;
  static const double _pad = 4;

  /// Space the bar takes above the safe area, for content padding.
  static const double height = _bar + AurumSpace.s16;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final bottom = MediaQuery.paddingOf(context).bottom;
    final animate = AurumMotion.control.shouldAnimate(context);
    final bubble = dark ? const Color(0x29FFFFFF) : const Color(0xE6FFFFFF);

    final pill = AurumGlass(
      level: AurumMaterialLevel.thin,
      radius: _bar / 2,
      lifted: true,
      solid: solid,
      child: SizedBox(
        height: _bar,
        width: tabs.length * _tab + 2 * _pad,
        child: Stack(
          children: [
            AnimatedPositionedDirectional(
              duration: animate ? AurumMotion.transition : Duration.zero,
              curve: AurumMotion.easeStandard,
              start: _pad + selectedIndex * _tab,
              top: _pad,
              bottom: _pad,
              width: _tab,
              child: DecoratedBox(
                decoration: ShapeDecoration(
                  color: bubble,
                  shape: RoundedSuperellipseBorder(
                    borderRadius: BorderRadius.circular(_bar / 2 - _pad),
                    side: BorderSide(color: Colors.white.withValues(alpha: dark ? 0.18 : 1)),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: _pad),
              child: Row(
                children: [
                  for (var i = 0; i < tabs.length; i++)
                    _FloatingTab(
                      tab: tabs[i],
                      selected: i == selectedIndex,
                      index: i,
                      count: tabs.length,
                      width: _tab,
                      onTap: () {
                        if (i != selectedIndex) AurumHaptics.play(AurumHaptic.selectionTick);
                        onSelected(i);
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );

    return Padding(
      padding: EdgeInsets.fromLTRB(AurumSpace.s16, 0, AurumSpace.s16, bottom > 0 ? bottom : AurumSpace.s16),
      child: Row(
        children: [
          Expanded(
            child: Align(
              alignment: AlignmentDirectional.centerStart,
              heightFactor: 1,
              child: FittedBox(fit: BoxFit.scaleDown, child: pill),
            ),
          ),
          if (action != null) ...[
            const SizedBox(width: AurumSpace.s12),
            _RoundGlassAction(action: action!, size: _bar, solid: solid, colors: c),
          ],
        ],
      ),
    );
  }
}

class _FloatingTab extends StatefulWidget {
  const _FloatingTab({
    required this.tab,
    required this.selected,
    required this.index,
    required this.count,
    required this.width,
    required this.onTap,
  });

  final AurumTab tab;
  final bool selected;
  final int index;
  final int count;
  final double width;
  final VoidCallback onTap;

  @override
  State<_FloatingTab> createState() => _FloatingTabState();
}

class _FloatingTabState extends State<_FloatingTab> {
  bool _focused = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final _FloatingTab(:tab, :selected, :index, :count, :width, :onTap) = widget;
    final c = context.aurum;
    final color = selected ? c.accent : c.textSecondary;
    return Semantics(
      container: true,
      button: true,
      selected: selected,
      label: tab.label,
      hint: 'Tab ${index + 1} of $count',
      onTap: onTap,
      excludeSemantics: true,
      child: Tooltip(
        message: tab.label,
        excludeFromSemantics: true,
        child: FocusableActionDetector(
          mouseCursor: SystemMouseCursors.click,
          onShowFocusHighlight: (v) => setState(() => _focused = v),
          actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => onTap())},
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            onTap: onTap,
            child: AurumPressScale(
              pressed: _pressed,
              scale: 0.9,
              child: DecoratedBox(
                position: DecorationPosition.foreground,
                decoration: ShapeDecoration(
                  shape: RoundedSuperellipseBorder(
                    borderRadius: BorderRadius.circular(width / 2),
                    side: _focused ? BorderSide(color: c.focus, width: AurumSize.focusWidth) : BorderSide.none,
                  ),
                ),
                child: SizedBox(
                  width: width,
                  height: double.infinity,
                  child: Center(
                    child:
                        tab.child ??
                        Icon(
                          selected ? (tab.selectedIcon ?? tab.icon) : tab.icon,
                          size: AurumSize.iconMd,
                          color: color,
                        ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RoundGlassAction extends StatefulWidget {
  const _RoundGlassAction({required this.action, required this.size, required this.solid, required this.colors});

  final AurumTabBarAction action;
  final double size;
  final bool? solid;
  final AurumColors colors;

  @override
  State<_RoundGlassAction> createState() => _RoundGlassActionState();
}

class _RoundGlassActionState extends State<_RoundGlassAction> {
  bool _pressed = false;
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final _RoundGlassAction(:action, :size, :solid, :colors) = widget;
    return Semantics(
      container: true,
      button: true,
      label: action.semanticLabel,
      onTap: action.onPressed,
      excludeSemantics: true,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => action.onPressed())},
        child: GestureDetector(
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp: (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          onTap: action.onPressed,
          child: AurumPressScale(
            pressed: _pressed,
            scale: 0.92,
            child: DecoratedBox(
              position: DecorationPosition.foreground,
              decoration: ShapeDecoration(
                shape: RoundedSuperellipseBorder(
                  borderRadius: BorderRadius.circular(size / 2),
                  side: _focused
                      ? BorderSide(
                          color: colors.focus,
                          width: AurumSize.focusWidth,
                          strokeAlign: BorderSide.strokeAlignOutside,
                        )
                      : BorderSide.none,
                ),
              ),
              child: AurumGlass(
                level: AurumMaterialLevel.thin,
                radius: size / 2,
                lifted: true,
                solid: solid,
                child: SizedBox.square(
                  dimension: size,
                  child: Icon(action.icon, size: AurumSize.iconMd, color: colors.textPrimary),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
