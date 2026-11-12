import 'package:flutter/material.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

import '../controls/aurum_button.dart';
import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';

/// The bar at the top of a screen: an optional [leading] control, a centred
/// title and optional [trailing] controls. The title stays centred on the
/// screen even when the sides differ in width.
class AurumTopBar extends StatelessWidget {
  const AurumTopBar({super.key, this.leading, this.title, this.titleText, this.trailing = const []})
    : assert(title == null || titleText == null, 'Pass title or titleText, not both.');

  final Widget? leading;

  /// A custom title, such as a picker. Use [titleText] for plain text.
  final Widget? title;
  final String? titleText;
  final List<Widget> trailing;

  static const double height = 56;

  @override
  Widget build(BuildContext context) {
    final center =
        title ??
        (titleText == null
            ? null
            : Semantics(
                header: true,
                child: Text(
                  titleText!,
                  style: context.aurumText(AurumType.headline),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ));
    return SizedBox(
      height: height,
      child: NavigationToolbar(
        leading: leading,
        middle: center,
        trailing: trailing.isEmpty ? null : Row(mainAxisSize: MainAxisSize.min, children: _spaced(trailing)),
        middleSpacing: AurumSpace.s8,
      ),
    );
  }

  static List<Widget> _spaced(List<Widget> items) => [
    for (var i = 0; i < items.length; i++) ...[if (i > 0) const SizedBox(width: AurumSpace.s8), items[i]],
  ];
}

/// A round back button that pops the current route, or calls [onPressed].
class AurumBackButton extends StatelessWidget {
  const AurumBackButton({super.key, this.onPressed, this.semanticLabel = 'Back'});

  final VoidCallback? onPressed;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return AurumButton(
      icon: rtl ? PhosphorIconsRegular.caretRight : PhosphorIconsRegular.caretLeft,
      semanticLabel: semanticLabel,
      variant: AurumButtonVariant.gray,
      capsule: true,
      onPressed: onPressed ?? () => Navigator.of(context).maybePop(),
    );
  }
}
