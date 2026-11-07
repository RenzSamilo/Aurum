import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';

/// The default brand ships as "Aurum"; in this repo its palette is called Viridian.
String paletteName(AurumBrand b) => b.name == 'Aurum' ? 'Viridian' : b.name;

/// Chips that switch the whole app between brand palettes.
class PalettePicker extends StatelessWidget {
  const PalettePicker({super.key, required this.brands, required this.selected, required this.onSelected});

  final List<AurumBrand> brands;
  final AurumBrand selected;
  final ValueChanged<AurumBrand> onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Semantics(header: true, child: Text('Palette', style: context.aurumText(AurumType.headline))),
        const SizedBox(height: AurumSpace.s8),
        Wrap(
          spacing: AurumSpace.s8,
          runSpacing: AurumSpace.s8,
          children: [
            for (final b in brands)
              _Chip(
                brand: b,
                selected: b.name == selected.name,
                onTap: () {
                  if (b.name != selected.name) AurumHaptics.play(AurumHaptic.selectionTick);
                  onSelected(b);
                },
              ),
          ],
        ),
      ],
    );
  }
}

class _Chip extends StatefulWidget {
  const _Chip({required this.brand, required this.selected, required this.onTap});

  final AurumBrand brand;
  final bool selected;
  final VoidCallback onTap;

  @override
  State<_Chip> createState() => _ChipState();
}

class _ChipState extends State<_Chip> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final brand = widget.brand;
    final selected = widget.selected;
    final onTap = widget.onTap;
    final c = context.aurum;
    final own = brand.colors(Theme.of(context).brightness);
    Widget dot(Color color) => Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        border: Border.all(color: c.surfaceCard, width: 1.5),
      ),
    );
    return Semantics(
      button: true,
      selected: selected,
      label: '${paletteName(brand)} palette',
      excludeSemantics: true,
      onTap: onTap,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => onTap())},
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: AurumMotion.feedback,
            curve: AurumMotion.easeStandard,
            height: AurumSize.target,
            padding: const EdgeInsetsDirectional.only(start: AurumSpace.s8, end: AurumSpace.s16),
            decoration: ShapeDecoration(
              color: selected ? Color.alphaBlend(c.accent.withValues(alpha: 0.12), c.surfaceCard) : c.surfaceCard,
              shape: StadiumBorder(
                side: _focused
                    ? BorderSide(color: c.focus, width: AurumSize.focusWidth)
                    : BorderSide(color: selected ? c.accent : c.borderDecorative, width: selected ? 2 : 1),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 30,
                  height: 18,
                  child: Stack(
                    children: [
                      dot(own.surfaceCanvas),
                      Positioned(left: 6, child: dot(own.accentSecondary)),
                      Positioned(left: 12, child: dot(own.accent)),
                    ],
                  ),
                ),
                const SizedBox(width: AurumSpace.s8),
                Text(paletteName(brand), style: context.aurumText(AurumType.subhead)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
