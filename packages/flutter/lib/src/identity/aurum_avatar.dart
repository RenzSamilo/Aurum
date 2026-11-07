import 'package:flutter/material.dart';

import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// A round picture of a person or thing. Without an [image], it shows the
/// initials of [name] on an accent tint. Screen readers read [name].
class AurumAvatar extends StatelessWidget {
  const AurumAvatar({super.key, required this.name, this.image, this.size = 40, this.ring = false});

  final String name;
  final ImageProvider? image;
  final double size;

  /// A hairline ring in the card colour, for avatars that sit on photos or tints.
  final bool ring;

  /// Up to two initials: first letters of the first and last words.
  static String initialsOf(String name) {
    final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '';
    final first = words.first.characters.first;
    final last = words.length > 1 ? words.last.characters.first : '';
    return (first + last).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final tint = Color.alphaBlend(c.accent.withValues(alpha: 0.16), c.surfaceCard);
    final role = size >= 64 ? AurumType.section : (size >= 40 ? AurumType.headline : AurumType.caption);
    final style = context.aurumText(role, color: c.accent).copyWith(fontSize: size * 0.4, height: 1);
    return Semantics(
      label: name,
      image: true,
      child: ExcludeSemantics(
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: tint,
            border: ring
                ? Border.all(
                    color: c.surfaceCard,
                    width: size >= 64 ? 4 : 2,
                    strokeAlign: BorderSide.strokeAlignOutside,
                  )
                : null,
            image: image == null ? null : DecorationImage(image: image!, fit: BoxFit.cover),
          ),
          alignment: Alignment.center,
          child: image == null ? Text(initialsOf(name), style: style, maxLines: 1) : null,
        ),
      ),
    );
  }
}
