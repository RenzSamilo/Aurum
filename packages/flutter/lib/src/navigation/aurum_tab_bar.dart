import 'package:flutter/material.dart';

import '../foundations/aurum_glass.dart';
import '../foundations/aurum_haptics.dart';
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

class _TabButton extends StatelessWidget {
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
  Widget build(BuildContext context) {
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
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => onTap())},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
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
    );
  }
}
