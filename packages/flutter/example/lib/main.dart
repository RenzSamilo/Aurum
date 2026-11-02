import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

void main() => runApp(const AurumPreviewApp());

class AurumPreviewApp extends StatefulWidget {
  const AurumPreviewApp({super.key});

  @override
  State<AurumPreviewApp> createState() => _AurumPreviewAppState();
}

class _AurumPreviewAppState extends State<AurumPreviewApp> {
  ThemeMode _mode = ThemeMode.system;
  bool _moreContrast = false;

  @override
  Widget build(BuildContext context) {
    final systemContrast = MediaQuery.maybeHighContrastOf(context) ?? false;
    final contrast = _moreContrast || systemContrast;
    return MaterialApp(
      title: 'Aurum',
      debugShowCheckedModeBanner: false,
      themeMode: _mode,
      theme: aurumTheme(Brightness.light, highContrast: contrast),
      darkTheme: aurumTheme(Brightness.dark, highContrast: contrast),
      home: PreviewPage(
        dark: _mode == ThemeMode.dark,
        moreContrast: _moreContrast,
        onDark: (v) => setState(() => _mode = v ? ThemeMode.dark : ThemeMode.light),
        onContrast: (v) => setState(() => _moreContrast = v),
      ),
    );
  }
}

class PreviewPage extends StatelessWidget {
  const PreviewPage({
    super.key,
    required this.dark,
    required this.moreContrast,
    required this.onDark,
    required this.onContrast,
  });

  final bool dark;
  final bool moreContrast;
  final ValueChanged<bool> onDark;
  final ValueChanged<bool> onContrast;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s32, AurumSpace.s16, AurumSpace.s64),
          children: [
            Text('Token preview', style: context.aurumText(AurumType.footnote, color: c.accent)),
            const SizedBox(height: AurumSpace.s4),
            Text('Aurum', style: context.aurumText(AurumType.display, color: c.textPrimary)),
            const SizedBox(height: AurumSpace.s8),
            Text(
              'Same tokens as the web preview. Edit tokens/ and run pnpm tokens.',
              style: context.aurumText(AurumType.body, color: c.textSecondary),
            ),
            const SizedBox(height: AurumSpace.s16),
            Wrap(spacing: AurumSpace.s8, runSpacing: AurumSpace.s8, children: [
              FilterChip(label: const Text('Dark'), selected: dark, onSelected: onDark),
              FilterChip(label: const Text('More contrast'), selected: moreContrast, onSelected: onContrast),
            ]),
            const _Section('Colour'),
            _Card(child: Column(children: [
              for (final (name, color) in [
                ('surfaceCanvas', c.surfaceCanvas),
                ('surfaceCard', c.surfaceCard),
                ('surfaceInset', c.surfaceInset),
                ('textPrimary', c.textPrimary),
                ('textSecondary', c.textSecondary),
                ('accent', c.accent),
                ('warning', c.warning),
                ('danger', c.danger),
              ])
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AurumSpace.s4),
                  child: Row(children: [
                    DecoratedBox(
                      decoration: ShapeDecoration(
                        color: color,
                        shape: RoundedSuperellipseBorder(
                          borderRadius: BorderRadius.circular(context.aurumRadii.sm),
                          side: BorderSide(color: c.borderDecorative),
                        ),
                      ),
                      child: const SizedBox.square(dimension: AurumSpace.s32),
                    ),
                    const SizedBox(width: AurumSpace.s12),
                    Text(name, style: context.aurumText(AurumType.footnote, color: c.textPrimary)),
                  ]),
                ),
            ])),
            const _Section('Type'),
            _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              for (final MapEntry(key: name, value: role) in AurumType.all.entries)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AurumSpace.s4),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Quarterly review, 3 of 12 done', style: context.aurumText(role, tabularFigures: true)),
                    Text('$name · ${role.size.round()}/${role.lineHeight.round()} · ${role.weight.round()}',
                        style: context.aurumText(AurumType.caption, color: c.textTertiary)),
                  ]),
                ),
            ])),
            const _Section('Shape'),
            Wrap(spacing: AurumSpace.s16, runSpacing: AurumSpace.s16, children: [
              for (final (name, r) in [
                ('sm', context.aurumRadii.sm),
                ('md', context.aurumRadii.md),
                ('lg', context.aurumRadii.lg),
                ('xl', context.aurumRadii.xl),
              ])
                _RadiusDemo(name: name, radius: r),
            ]),
            const _Section('Motion'),
            const _Card(child: Column(children: [
              _SpringRow(name: 'control', spring: AurumMotion.control),
              _SpringRow(name: 'surface', spring: AurumMotion.surface),
              _SpringRow(name: 'reward', spring: AurumMotion.reward),
            ])),
            const _Section('Icons'),
            _Card(child: Wrap(spacing: AurumSpace.s16, children: [
              for (final icon in [PhosphorIconsRegular.house, PhosphorIconsBold.magnifyingGlass, PhosphorIconsFill.bell, PhosphorIconsRegular.gear])
                Icon(icon, size: AurumSize.iconMd, color: c.textPrimary),
            ])),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title);
  final String title;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: AurumSpace.s48, bottom: AurumSpace.s16),
        child: Text(title, style: context.aurumText(AurumType.section, color: context.aurum.textPrimary)),
      );
}

class _Card extends StatelessWidget {
  const _Card({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return DecoratedBox(
      decoration: ShapeDecoration(
        color: c.surfaceCard,
        shadows: AurumShadow.level1,
        shape: RoundedSuperellipseBorder(
          borderRadius: BorderRadius.circular(context.aurumRadii.lg),
          side: BorderSide(color: c.borderDecorative),
        ),
      ),
      child: Padding(padding: const EdgeInsets.all(AurumSpace.s24), child: child),
    );
  }
}

class _RadiusDemo extends StatelessWidget {
  const _RadiusDemo({required this.name, required this.radius});
  final String name;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    const pad = AurumSpace.s12;
    return SizedBox(
      width: 150,
      child: DecoratedBox(
        decoration: ShapeDecoration(
          color: c.surfaceCard,
          shape: RoundedSuperellipseBorder(
            borderRadius: BorderRadius.circular(radius),
            side: BorderSide(color: c.borderDecorative),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(pad),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            AspectRatio(
              aspectRatio: 4 / 3,
              child: DecoratedBox(
                decoration: ShapeDecoration(
                  color: c.surfaceInset,
                  shape: RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(AurumRadii.inner(radius, pad))),
                ),
              ),
            ),
            const SizedBox(height: AurumSpace.s8),
            Text('$name · ${radius.round()}', style: context.aurumText(AurumType.caption, color: c.textSecondary)),
          ]),
        ),
      ),
    );
  }
}

/// Runs a token spring with SpringSimulation, so a tap mid-flight keeps velocity.
class _SpringRow extends StatefulWidget {
  const _SpringRow({required this.name, required this.spring});
  final String name;
  final AurumSpring spring;

  @override
  State<_SpringRow> createState() => _SpringRowState();
}

class _SpringRowState extends State<_SpringRow> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController.unbounded(vsync: this);
  bool _on = false;

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  void _toggle() {
    _on = !_on;
    if (MediaQuery.disableAnimationsOf(context)) {
      _c.value = _on ? 1 : 0;
      return;
    }
    _c.animateWith(SpringSimulation(widget.spring.description, _c.value, _on ? 1 : 0, _c.velocity));
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final s = widget.spring;
    return InkWell(
      onTap: _toggle,
      borderRadius: BorderRadius.circular(context.aurumRadii.sm),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AurumSpace.s8),
        child: Row(children: [
          SizedBox(
            width: 120,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.name, style: context.aurumText(AurumType.headline, color: c.textPrimary)),
              Text('${s.duration.toStringAsFixed(2)}s · bounce ${s.bounce.toStringAsFixed(2)}',
                  style: context.aurumText(AurumType.caption, color: c.textTertiary)),
            ]),
          ),
          Expanded(
            child: LayoutBuilder(builder: (context, box) {
              const dot = AurumSpace.s32;
              return Container(
                height: dot,
                decoration: ShapeDecoration(color: c.surfaceInset, shape: const StadiumBorder()),
                child: AnimatedBuilder(
                  animation: _c,
                  builder: (context, _) => Transform.translate(
                    offset: Offset(_c.value * (box.maxWidth - dot), 0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        width: dot,
                        height: dot,
                        decoration: ShapeDecoration(color: c.accent, shape: const CircleBorder()),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ]),
      ),
    );
  }
}
