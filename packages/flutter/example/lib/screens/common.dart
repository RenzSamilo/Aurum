import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';

/// Soft fills built from the brand colours, for tiles and plan cards.
extension SampleTints on AurumColors {
  Color get accentSoft => Color.alphaBlend(accent.withValues(alpha: 0.16), surfaceCard);
  Color get secondarySoft => Color.alphaBlend(accentSecondary.withValues(alpha: 0.22), surfaceCard);

  bool get _isDark => surfaceCanvas.computeLuminance() < 0.2;

  /// A deep, high-emphasis fill: green-black in light mode, a raised gilt-dark
  /// in dark mode (an inverted light tile glares on a dark screen).
  Color get inverse =>
      _isDark ? Color.alphaBlend(accentSecondary.withValues(alpha: 0.16), surfaceElevated) : textPrimary;
  Color get onInverse => _isDark ? textPrimary : surfaceCanvas;
}

/// A round icon on a fill, used as a leading mark in tiles and rows.
class IconDisc extends StatelessWidget {
  const IconDisc({super.key, required this.icon, required this.background, required this.foreground, this.size = 40});

  final IconData icon;
  final Color background;
  final Color foreground;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: background),
    child: Icon(icon, size: size * 0.5, color: foreground),
  );
}

/// A section heading with an optional action on the end, e.g. "See all".
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.action, this.onAction, this.actionIcon});

  final String title;
  final String? action;
  final IconData? actionIcon;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Expanded(
        child: Semantics(header: true, child: Text(title, style: context.aurumText(AurumType.headline))),
      ),
      if (action != null)
        AurumButton(
          label: action,
          icon: actionIcon,
          variant: AurumButtonVariant.plain,
          size: AurumButtonSize.sm,
          onPressed: onAction ?? () {},
        ),
    ],
  );
}

/// Pushes [page] with the platform's page transition.
void openPage(BuildContext context, Widget page) =>
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));
