import 'package:flutter/material.dart';

import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';

enum AurumBadgeTone { accent, secondary, neutral, danger }

/// soft: tinted fill. solid: full colour, for the one badge that must pop.
/// outline: hairline border, for quiet labels on coloured surfaces.
enum AurumBadgeStyle { soft, solid, outline }

/// A small status label, such as "New", "Pro" or "Free".
class AurumBadge extends StatelessWidget {
  const AurumBadge({
    super.key,
    required this.label,
    this.tone = AurumBadgeTone.accent,
    this.style = AurumBadgeStyle.soft,
  });

  final String label;
  final AurumBadgeTone tone;
  final AurumBadgeStyle style;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final color = switch (tone) {
      AurumBadgeTone.accent => c.accent,
      AurumBadgeTone.secondary => c.accentSecondary,
      AurumBadgeTone.neutral => c.textSecondary,
      AurumBadgeTone.danger => c.danger,
    };
    final (Color bg, Color fg, BorderSide side) = switch (style) {
      AurumBadgeStyle.soft => (Color.alphaBlend(color.withValues(alpha: 0.14), c.surfaceCard), color, BorderSide.none),
      AurumBadgeStyle.solid => (color, c.onAccent, BorderSide.none),
      AurumBadgeStyle.outline => (
        const Color(0x00000000),
        c.textPrimary,
        BorderSide(color: c.textPrimary.withValues(alpha: 0.5)),
      ),
    };
    final text = context
        .aurumText(AurumType.caption, color: fg)
        .copyWith(
          fontWeight: FontWeight.w600,
          fontVariations: const [FontVariation('wght', 600), FontVariation('opsz', 12)],
        );
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s8, vertical: AurumSpace.s2),
      decoration: ShapeDecoration(
        color: bg,
        shape: StadiumBorder(side: side),
      ),
      child: Text(label, style: text, maxLines: 1),
    );
  }
}
