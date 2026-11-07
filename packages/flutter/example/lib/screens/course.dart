import 'dart:math' as math;

import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

/// A learning app, built to test Aurum's glass parts over colour and imagery.
/// Names and art are placeholder; the art is drawn from gradients.

const _teacher = 'Mara Quill';
const _me = 'Renz Samilo';

// ---------------------------------------------------------------------------
// Shared pieces

/// Placeholder cover art: soft blobs of colour, the same in light and dark
/// mode, like a photo would be.
class CourseArt extends StatelessWidget {
  const CourseArt({super.key, this.variant = 0, this.child});

  final int variant;
  final Widget? child;

  static const _sets = [
    // Studio: plum, magenta and a warm key light.
    [Color(0xFF2A1233), Color(0xFF8E3B8A), Color(0xFFE48A6A), Color(0xFF4B2A7A)],
    // Bloom: peach and rose on lilac.
    [Color(0xFFF2B48C), Color(0xFFE77BA7), Color(0xFFB98AE0), Color(0xFFF6D0A8)],
    // Dusk: violet into pink.
    [Color(0xFF3B2160), Color(0xFFB65FA8), Color(0xFFF0A7C4), Color(0xFF6E4AA8)],
  ];

  @override
  Widget build(BuildContext context) {
    final s = _sets[variant % _sets.length];
    return Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [s[0], s[3]]),
          ),
        ),
        _Blob(color: s[1], alignment: const Alignment(-0.6, -0.2), size: 1.1),
        _Blob(color: s[2], alignment: const Alignment(0.7, 0.5), size: 0.9),
        if (variant == 1) const _Petals(),
        if (variant != 1) _Blob(color: s[2].withValues(alpha: 0.7), alignment: const Alignment(0.1, -0.7), size: 0.5),
        ?child,
      ],
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.color, required this.alignment, required this.size});

  final Color color;
  final Alignment alignment;
  final double size;

  @override
  Widget build(BuildContext context) => Align(
    alignment: alignment,
    child: FractionallySizedBox(
      widthFactor: size,
      heightFactor: size,
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: RadialGradient(colors: [color, color.withValues(alpha: 0)])),
      ),
    ),
  );
}

/// Soft petal shapes for the Bloom art.
class _Petals extends StatelessWidget {
  const _Petals();

  @override
  Widget build(BuildContext context) => CustomPaint(painter: _PetalPainter());
}

class _PetalPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width * 0.55, size.height * 0.62);
    for (var i = 0; i < 7; i++) {
      final a = -math.pi / 2 + (i - 3) * 0.32;
      canvas.save();
      canvas.translate(c.dx, c.dy);
      canvas.rotate(a + math.pi / 2);
      final r = Rect.fromCenter(
        center: Offset(0, -size.height * 0.26),
        width: size.width * 0.16,
        height: size.height * 0.44,
      );
      canvas.drawOval(
        r,
        Paint()
          ..shader = LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [const Color(0x00FFFFFF), const Color(0xFFFCE3EC).withValues(alpha: 0.75)],
          ).createShader(r),
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_PetalPainter old) => false;
}

/// A canvas with soft glows of the brand colours, so glass has something to
/// pick up. Stronger in dark mode, where the canvas is near black.
class GlowBackdrop extends StatelessWidget {
  const GlowBackdrop({super.key, required this.child, this.warm = false});

  final Widget child;

  /// Adds a warm glow on the right edge.
  final bool warm;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final k = dark ? 0.42 : 0.22;
    return DecoratedBox(
      decoration: BoxDecoration(color: c.surfaceCanvas),
      child: Stack(
        children: [
          Positioned.fill(
            child: Stack(
              children: [
                _Blob(
                  color: const Color(0xFF9B4DB0).withValues(alpha: k),
                  alignment: const Alignment(-1.2, -0.9),
                  size: 1.4,
                ),
                _Blob(
                  color: const Color(0xFFE07BA8).withValues(alpha: k * 0.8),
                  alignment: const Alignment(0.2, 0.1),
                  size: 1.2,
                ),
                if (warm)
                  _Blob(
                    color: const Color(0xFFF08A5D).withValues(alpha: k),
                    alignment: const Alignment(1.6, -0.2),
                    size: 1.3,
                  ),
                _Blob(
                  color: c.accent.withValues(alpha: k * 0.6),
                  alignment: const Alignment(-0.8, 1.2),
                  size: 1.2,
                ),
              ],
            ),
          ),
          child,
        ],
      ),
    );
  }
}

/// Re-themes [child] for controls that sit on imagery or video: white text
/// and dark clear glass, in light and dark mode alike.
class OnMedia extends StatelessWidget {
  const OnMedia({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final c = context.aurum.copyWith(
      textPrimary: const Color(0xFFFFFFFF),
      textSecondary: const Color(0xD9FFFFFF),
      textTertiary: const Color(0xB3FFFFFF),
      accent: const Color(0xFFFFFFFF),
      focus: const Color(0xFFFFFFFF),
      materialTintBase: const Color(0xFF140E18),
      materialAlphaClear: 0.22,
      materialAlphaUltralight: 0.36,
    );
    return Theme(
      data: t.copyWith(
        brightness: Brightness.dark,
        extensions: [c, ...t.extensions.values.where((e) => e is! AurumColors)],
      ),
      child: DefaultTextStyle.merge(
        style: const TextStyle(color: Color(0xFFFFFFFF)),
        child: child,
      ),
    );
  }
}

/// Overlapping avatars with a count, e.g. "+1K" learners.
class AvatarStack extends StatelessWidget {
  const AvatarStack({super.key, required this.names, required this.more, this.size = 28});

  final List<String> names;
  final String more;
  final double size;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final step = size * 0.62;
    return Semantics(
      label: '${names.join(', ')} and $more more',
      child: ExcludeSemantics(
        child: SizedBox(
          height: size,
          width: step * names.length + size,
          child: Stack(
            children: [
              for (var i = 0; i < names.length; i++)
                Positioned(
                  left: i * step,
                  child: AurumAvatar(name: names[i], size: size, ring: true),
                ),
              Positioned(
                left: names.length * step,
                child: Container(
                  width: size,
                  height: size,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: c.textPrimary,
                    border: Border.all(color: c.surfaceCard, width: 2, strokeAlign: BorderSide.strokeAlignOutside),
                  ),
                  child: Text(
                    more,
                    style: context
                        .aurumText(
                          AurumType.micro,
                          color: c.textPrimary.computeLuminance() > 0.5
                              ? const Color(0xFF1E1723)
                              : const Color(0xFFFFFFFF),
                        )
                        .copyWith(fontSize: size * 0.32),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A small icon and text pair, e.g. a clock and "18h 9m".
class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.text, {this.iconColor});

  final IconData icon;
  final String text;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: iconColor ?? c.textSecondary),
        const SizedBox(width: AurumSpace.s4),
        Text(text, style: context.aurumText(AurumType.footnote, color: c.textPrimary)),
      ],
    );
  }
}

/// "4 lessons ›": a quiet trailing link on a card.
class _MoreLink extends StatelessWidget {
  const _MoreLink(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(text, style: context.aurumText(AurumType.footnote, color: c.textPrimary)),
        const SizedBox(width: AurumSpace.s2),
        Icon(PhosphorIconsRegular.caretRight, size: 14, color: c.textSecondary),
      ],
    );
  }
}

/// A round glass mark for the start of a row: a frosted disc with an icon.
class GlassDisc extends StatelessWidget {
  const GlassDisc({super.key, required this.icon, this.size = 44, this.bright = false});

  final IconData icon;
  final double size;

  /// A near-white disc, for the highlighted row.
  final bool bright;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    if (bright) {
      return Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFFFFFFF)),
        child: Icon(icon, size: size * 0.48, color: const Color(0xFF1E1723)),
      );
    }
    return AurumGlass(
      level: AurumMaterialLevel.clear,
      radius: size / 2,
      child: SizedBox.square(
        dimension: size,
        child: Icon(icon, size: size * 0.48, color: c.textPrimary),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 1. Course detail, with a video player

class CourseDetail extends StatelessWidget {
  const CourseDetail({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final top = MediaQuery.paddingOf(context).top;
    final heroHeight = 320.0 + top;
    return Scaffold(
      body: GlowBackdrop(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            SizedBox(
              height: heroHeight,
              child: ClipRSuperellipse(
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(context.aurumRadii.xl)),
                child: CourseArt(
                  variant: 0,
                  child: OnMedia(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(AurumSpace.s16, top + AurumSpace.s8, AurumSpace.s16, AurumSpace.s16),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              AurumButton(
                                icon: PhosphorIconsRegular.arrowLeft,
                                semanticLabel: 'Back',
                                variant: AurumButtonVariant.glass,
                                capsule: true,
                                onPressed: () => Navigator.of(context).maybePop(),
                              ),
                              const Spacer(),
                              AurumButton(
                                icon: PhosphorIconsRegular.bookmarkSimple,
                                semanticLabel: 'Save course',
                                variant: AurumButtonVariant.glass,
                                capsule: true,
                                onPressed: () {},
                              ),
                            ],
                          ),
                          const Spacer(),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Padding(
                              padding: const EdgeInsets.only(right: AurumSpace.s8, bottom: AurumSpace.s4),
                              child: Text(
                                '12:18 / 28:00',
                                style: context.aurumText(
                                  AurumType.micro,
                                  color: const Color(0xD9FFFFFF),
                                  tabularFigures: true,
                                ),
                              ),
                            ),
                          ),
                          const _PlayerBar(progress: 0.44),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s24, AurumSpace.s16, AurumSpace.s48),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Semantics(header: true, child: Text('Idea Lab', style: context.aurumText(AurumType.page))),
                  const SizedBox(height: AurumSpace.s8),
                  Text(
                    'A quick, hands-on course on finding, shaping and sharpening ideas for creative projects and products.',
                    style: context
                        .aurumText(AurumType.callout, color: c.textSecondary)
                        .copyWith(fontWeight: FontWeight.w400),
                  ),
                  const SizedBox(height: AurumSpace.s24),
                  Row(
                    children: [
                      const AurumAvatar(name: _teacher, size: 48),
                      const SizedBox(width: AurumSpace.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('By', style: context.aurumText(AurumType.caption, color: c.textSecondary)),
                            Text(_teacher, style: context.aurumText(AurumType.headline)),
                          ],
                        ),
                      ),
                      Semantics(
                        label: 'Rated 4.9 out of 5',
                        child: ExcludeSemantics(
                          child: Row(
                            children: [
                              Text('4.9', style: context.aurumText(AurumType.headline)),
                              const SizedBox(width: AurumSpace.s4),
                              const Icon(PhosphorIconsFill.star, size: 20, color: Color(0xFFE8B54A)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AurumSpace.s24),
                  Row(
                    children: [
                      Expanded(child: Text('Lessons', style: context.aurumText(AurumType.headline))),
                      Text('14', style: context.aurumText(AurumType.subhead, color: c.textSecondary)),
                    ],
                  ),
                  const SizedBox(height: AurumSpace.s12),
                  const _LessonCard(
                    icon: PhosphorIconsRegular.lightbulb,
                    title: 'Finding the spark',
                    length: '28 min',
                    count: '1 lesson',
                    current: true,
                  ),
                  const SizedBox(height: AurumSpace.s8),
                  const _LessonCard(
                    icon: PhosphorIconsRegular.cube,
                    title: 'Building concepts',
                    length: '47 min',
                    count: '2 lessons',
                  ),
                  const SizedBox(height: AurumSpace.s8),
                  const _LessonCard(
                    icon: PhosphorIconsRegular.pencilSimple,
                    title: 'Sketching fast',
                    length: '35 min',
                    count: '3 lessons',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Playback speed, a scrubber and full screen, on one clear-glass capsule.
class _PlayerBar extends StatelessWidget {
  const _PlayerBar({required this.progress});
  final double progress;

  @override
  Widget build(BuildContext context) {
    return AurumGlass(
      level: AurumMaterialLevel.clear,
      radius: 28,
      padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s4),
      child: SizedBox(
        height: 52,
        child: Row(
          children: [
            AurumButton(
              label: '1x',
              semanticLabel: 'Playback speed, 1x',
              variant: AurumButtonVariant.glass,
              size: AurumButtonSize.sm,
              capsule: true,
              onPressed: () {},
            ),
            const SizedBox(width: AurumSpace.s12),
            Expanded(
              child: Semantics(
                slider: true,
                label: 'Playback position',
                value: '12 minutes 18 seconds of 28 minutes',
                child: SizedBox(height: 20, child: CustomPaint(painter: _ScrubPainter(progress))),
              ),
            ),
            const SizedBox(width: AurumSpace.s4),
            AurumButton(
              icon: PhosphorIconsRegular.cornersOut,
              semanticLabel: 'Full screen',
              variant: AurumButtonVariant.plain,
              size: AurumButtonSize.sm,
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _ScrubPainter extends CustomPainter {
  const _ScrubPainter(this.p);
  final double p;

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height / 2;
    final line = Paint()
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(0, y), Offset(size.width, y), line..color = const Color(0x4DFFFFFF));
    final x = size.width * p;
    canvas.drawLine(Offset(0, y), Offset(x, y), line..color = const Color(0xFFFFFFFF));
    canvas.drawCircle(Offset(x, y), 6, Paint()..color = const Color(0xFFFFFFFF));
  }

  @override
  bool shouldRepaint(_ScrubPainter old) => old.p != p;
}

class _LessonCard extends StatelessWidget {
  const _LessonCard({
    required this.icon,
    required this.title,
    required this.length,
    required this.count,
    this.current = false,
  });

  final IconData icon;
  final String title;
  final String length;
  final String count;
  final bool current;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return AurumCard(
      material: AurumMaterialLevel.ultralight,
      lifted: false,
      padding: const EdgeInsets.all(AurumSpace.s12),
      semanticLabel: '$title, $length, $count',
      onPressed: () {},
      child: Row(
        children: [
          GlassDisc(icon: icon, bright: current),
          const SizedBox(width: AurumSpace.s12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: context.aurumText(AurumType.subhead)),
                Text(length, style: context.aurumText(AurumType.caption, color: c.textSecondary)),
              ],
            ),
          ),
          _MoreLink(count),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 2. My courses: home with a carousel and a floating glass tab bar

class CourseHome extends StatefulWidget {
  const CourseHome({super.key});

  @override
  State<CourseHome> createState() => _CourseHomeState();
}

class _CourseHomeState extends State<CourseHome> {
  int _tab = 0;
  String _view = 'mine';

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return Scaffold(
      extendBody: true,
      body: GlowBackdrop(
        child: ListView(
          padding: EdgeInsets.only(top: top + AurumSpace.s8, bottom: AurumFloatingTabBar.height + AurumSpace.s32),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16),
              child: Row(
                children: [
                  const AurumAvatar(name: _me, size: 48),
                  const Spacer(),
                  AurumButton(
                    icon: PhosphorIconsRegular.bellSimple,
                    semanticLabel: 'Notifications',
                    variant: AurumButtonVariant.glass,
                    capsule: true,
                    onPressed: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: AurumSpace.s8),
            Center(
              child: SizedBox(
                width: 240,
                child: AurumSegmentedControl<String>(
                  glass: true,
                  small: true,
                  segments: const [
                    AurumSegment(value: 'mine', label: 'My courses'),
                    AurumSegment(value: 'progress', label: 'Progress'),
                  ],
                  value: _view,
                  onChanged: (v) => setState(() => _view = v),
                ),
              ),
            ),
            const SizedBox(height: AurumSpace.s16),
            const _Carousel(),
            const SizedBox(height: AurumSpace.s24),
            const _Library(),
          ],
        ),
      ),
      bottomNavigationBar: AurumFloatingTabBar(
        tabs: const [
          AurumTab(icon: PhosphorIconsRegular.house, selectedIcon: PhosphorIconsFill.house, label: 'Home'),
          AurumTab(
            icon: PhosphorIconsRegular.chatCircle,
            selectedIcon: PhosphorIconsFill.chatCircle,
            label: 'Messages',
          ),
          AurumTab(icon: PhosphorIconsRegular.compass, selectedIcon: PhosphorIconsFill.compass, label: 'Explore'),
          AurumTab(icon: PhosphorIconsRegular.gear, selectedIcon: PhosphorIconsFill.gear, label: 'Settings'),
        ],
        selectedIndex: _tab,
        onSelected: (i) => setState(() => _tab = i),
        action: AurumTabBarAction(
          icon: PhosphorIconsRegular.magnifyingGlass,
          semanticLabel: 'Search',
          onPressed: () {},
        ),
      ),
    );
  }
}

class _Carousel extends StatefulWidget {
  const _Carousel();

  @override
  State<_Carousel> createState() => _CarouselState();
}

class _CarouselState extends State<_Carousel> {
  final _page = PageController(viewportFraction: 0.74);

  @override
  void dispose() {
    _page.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 300,
    child: PageView(
      controller: _page,
      children: const [
        _CourseCover(variant: 2, title: 'Prompting for makers', index: 1),
        _CourseCover(variant: 0, title: 'Story in motion', index: 2),
        _CourseCover(variant: 1, title: 'Colour for screens', index: 3),
      ],
    ),
  );
}

class _CourseCover extends StatelessWidget {
  const _CourseCover({required this.variant, required this.title, required this.index});

  final int variant;
  final String title;
  final int index;

  @override
  Widget build(BuildContext context) {
    final r = context.aurumRadii.xl;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s8),
      child: Semantics(
        container: true,
        label: '$title, course $index of 5, active',
        child: DecoratedBox(
          decoration: ShapeDecoration(
            shape: RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(r)),
            shadows: AurumShadow.level2,
          ),
          child: ClipRSuperellipse(
            borderRadius: BorderRadius.circular(r),
            child: CourseArt(
              variant: variant,
              child: OnMedia(
                child: Builder(
                  builder: (context) => Padding(
                    padding: const EdgeInsets.all(AurumSpace.s12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const AvatarStack(names: ['Ana', 'Theo'], more: '+1K'),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s12, vertical: AurumSpace.s4),
                              decoration: const ShapeDecoration(color: Color(0xFFFFFFFF), shape: StadiumBorder()),
                              child: Text(
                                'Active',
                                style: context.aurumText(AurumType.caption, color: const Color(0xFF1E1723)),
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Text(
                          title,
                          style: context.aurumText(AurumType.section, color: const Color(0xFFFFFFFF)),
                          maxLines: 2,
                        ),
                        const SizedBox(height: AurumSpace.s4),
                        const Wrap(
                          spacing: AurumSpace.s12,
                          children: [
                            _Meta(PhosphorIconsRegular.clock, '18h 9m'),
                            _Meta(PhosphorIconsFill.star, '4.7', iconColor: Color(0xFFF3C55B)),
                            _Meta(PhosphorIconsRegular.videoCamera, '16'),
                          ],
                        ),
                        const SizedBox(height: AurumSpace.s8),
                        Row(
                          children: [
                            AurumGlass(
                              level: AurumMaterialLevel.clear,
                              radius: 16,
                              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s12, vertical: 6),
                              child: Text('$index of 5', style: context.aurumText(AurumType.caption)),
                            ),
                            const Spacer(),
                            Flexible(child: _ContinueLink(onPressed: () {})),
                          ],
                        ),
                      ],
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

/// The library panel: filter tabs with counts and a featured course.
class _Library extends StatefulWidget {
  const _Library();

  @override
  State<_Library> createState() => _LibraryState();
}

class _LibraryState extends State<_Library> {
  int _filter = 1;

  static const _filters = [('All courses', 12), ('Completed', 7), ('In progress', 3), ('Saved', 9)];

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s8),
      child: AurumGlass(
        level: AurumMaterialLevel.regular,
        radius: context.aurumRadii.xl,
        padding: const EdgeInsets.fromLTRB(0, AurumSpace.s8, 0, AurumSpace.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s8),
              child: Row(
                children: [
                  for (var i = 0; i < _filters.length; i++)
                    _CountTab(
                      label: _filters[i].$1,
                      count: _filters[i].$2,
                      selected: i == _filter,
                      onTap: () => setState(() => _filter = i),
                    ),
                ],
              ),
            ),
            const SizedBox(height: AurumSpace.s8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 140,
                    height: 168,
                    child: ClipRSuperellipse(
                      borderRadius: BorderRadius.circular(context.aurumRadii.lg),
                      child: const CourseArt(variant: 1),
                    ),
                  ),
                  const SizedBox(width: AurumSpace.s16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const AvatarStack(names: ['Lia', 'Jon'], more: '+2K', size: 26),
                        const SizedBox(height: AurumSpace.s12),
                        Text('Sketch to screen', style: context.aurumText(AurumType.section)),
                        const SizedBox(height: AurumSpace.s4),
                        Text(
                          '9 lessons · 4h 20m',
                          style: context.aurumText(AurumType.footnote, color: c.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A text tab with a superscript count, e.g. "Completed ⁷".
class _CountTab extends StatelessWidget {
  const _CountTab({required this.label, required this.count, required this.selected, required this.onTap});

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final color = selected ? c.textPrimary : c.textSecondary;
    var style = context.aurumText(AurumType.subhead, color: color);
    if (selected) {
      style = style.copyWith(fontWeight: FontWeight.w600, fontVariations: const [FontVariation('wght', 600)]);
    }
    return Semantics(
      button: true,
      selected: selected,
      label: '$label, $count',
      excludeSemantics: true,
      onTap: onTap,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AurumSize.target),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(label, style: style),
                Transform.translate(
                  offset: const Offset(1, -6),
                  child: Text('$count', style: context.aurumText(AurumType.micro, color: color).copyWith(fontSize: 10)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Weekly schedule

class CourseSchedule extends StatefulWidget {
  const CourseSchedule({super.key});

  @override
  State<CourseSchedule> createState() => _CourseScheduleState();
}

class _CourseScheduleState extends State<CourseSchedule> {
  int _day = 3;

  static const _days = [
    ('Sun', 4, 1.0, null),
    ('Mon', 5, 1.0, null),
    ('Tue', 6, 1.0, null),
    ('Wed', 7, 0.5, '3/6'),
    ('Thu', 8, 0.0, null),
    ('Fri', 9, 0.0, null),
    ('Sat', 10, 0.0, null),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final pad = MediaQuery.paddingOf(context);
    return Scaffold(
      body: GlowBackdrop(
        warm: true,
        child: Stack(
          children: [
            ListView(
              padding: EdgeInsets.fromLTRB(AurumSpace.s16, pad.top + AurumSpace.s8, AurumSpace.s16, pad.bottom + 120),
              children: [
                Row(
                  children: [
                    AurumButton(
                      icon: PhosphorIconsRegular.arrowLeft,
                      semanticLabel: 'Back',
                      variant: AurumButtonVariant.glass,
                      capsule: true,
                      onPressed: () => Navigator.of(context).maybePop(),
                    ),
                    const Spacer(),
                    AurumButton(
                      icon: PhosphorIconsRegular.bellSimple,
                      semanticLabel: 'Reminders',
                      variant: AurumButtonVariant.glass,
                      capsule: true,
                      onPressed: () {},
                    ),
                  ],
                ),
                const SizedBox(height: AurumSpace.s8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AurumButton(
                      icon: PhosphorIconsRegular.caretLeft,
                      semanticLabel: 'Previous week',
                      variant: AurumButtonVariant.plain,
                      onPressed: () {},
                    ),
                    Semantics(
                      header: true,
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(text: 'March ', style: context.aurumText(AurumType.card)),
                            TextSpan(
                              text: '4–10',
                              style: context.aurumText(AurumType.card, color: c.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    AurumButton(
                      icon: PhosphorIconsRegular.caretRight,
                      semanticLabel: 'Next week',
                      variant: AurumButtonVariant.plain,
                      onPressed: () {},
                    ),
                  ],
                ),
                const SizedBox(height: AurumSpace.s12),
                Row(
                  children: [
                    for (var i = 0; i < _days.length; i++)
                      Expanded(
                        child: _DayRing(
                          label: _days[i].$1,
                          date: _days[i].$2,
                          value: _days[i].$3,
                          center: _days[i].$4,
                          selected: i == _day,
                          onTap: () => setState(() => _day = i),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: AurumSpace.s24),
                Center(
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(text: 'Schedule  ', style: context.aurumText(AurumType.subhead)),
                        TextSpan(
                          text: 'Today, 7 March',
                          style: context.aurumText(AurumType.subhead, color: c.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AurumSpace.s12),
                const _SessionCard(
                  icon: PhosphorIconsRegular.rocketLaunch,
                  title: 'Prompting for makers',
                  length: '42 min',
                  percent: 67,
                  time: '11:30 AM',
                  lessons: '4 lessons',
                  now: true,
                ),
                const SizedBox(height: AurumSpace.s12),
                const _SessionCard(
                  icon: PhosphorIconsRegular.briefcase,
                  title: 'Visual directions',
                  length: '56 min',
                  percent: 42,
                  time: '02:30 PM',
                  lessons: '8 lessons',
                ),
                const SizedBox(height: AurumSpace.s12),
                const _SessionCard(
                  icon: PhosphorIconsRegular.briefcase,
                  title: 'Refining your best ideas',
                  length: '18 min',
                  percent: 17,
                  time: '05:30 PM',
                  lessons: '2 lessons',
                  later: true,
                ),
              ],
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: pad.bottom + AurumSpace.s16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AurumButton(
                    icon: PhosphorIconsRegular.pencilSimple,
                    semanticLabel: 'Edit schedule',
                    variant: AurumButtonVariant.glass,
                    capsule: true,
                    onPressed: () {},
                  ),
                  const SizedBox(width: AurumSpace.s12),
                  AurumButton(
                    icon: PhosphorIconsRegular.plus,
                    semanticLabel: 'Add session',
                    variant: AurumButtonVariant.glass,
                    capsule: true,
                    onPressed: () {},
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DayRing extends StatelessWidget {
  const _DayRing({
    required this.label,
    required this.date,
    required this.value,
    required this.center,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int date;
  final double value;
  final String? center;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final done = value >= 1;
    final size = selected ? 44.0 : 34.0;
    var labelStyle = context.aurumText(AurumType.caption, color: selected ? c.textPrimary : c.textSecondary);
    if (selected) {
      labelStyle = labelStyle.copyWith(fontWeight: FontWeight.w700, fontVariations: const [FontVariation('wght', 700)]);
    }
    return Semantics(
      button: true,
      selected: selected,
      label: '$label $date March, ${(value * 100).round()}% done',
      excludeSemantics: true,
      onTap: onTap,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: SizedBox(
          height: 76,
          child: Column(
            children: [
              Text(label, style: labelStyle),
              const SizedBox(height: AurumSpace.s8),
              SizedBox(
                height: 44,
                child: Center(
                  child: AurumProgressRing(
                    value: value,
                    size: size,
                    stroke: selected ? 4 : 3,
                    color: done ? c.accentSecondary : c.accent,
                    child: Text(
                      center ?? (value > 0 ? '$date' : ''),
                      style: context.aurumText(selected ? AurumType.caption : AurumType.micro, tabularFigures: true),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.icon,
    required this.title,
    required this.length,
    required this.percent,
    required this.time,
    required this.lessons,
    this.now = false,
    this.later = false,
  });

  final IconData icon;
  final String title;
  final String length;
  final int percent;
  final String time;
  final String lessons;

  /// The session happening now: tinted glass and a bright mark.
  final bool now;

  /// Later today: dimmed.
  final bool later;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final card = AurumCard(
      material: AurumMaterialLevel.ultralight,
      color: now ? c.accent : null,
      lifted: false,
      padding: const EdgeInsets.all(AurumSpace.s12),
      semanticLabel: '$title, $length, $percent% done, at $time, $lessons',
      onPressed: () {},
      child: Column(
        children: [
          Row(
            children: [
              GlassDisc(icon: icon, bright: now, size: 48),
              const SizedBox(width: AurumSpace.s12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: context.aurumText(AurumType.subhead)),
                    Text(length, style: context.aurumText(AurumType.caption, color: c.textSecondary)),
                  ],
                ),
              ),
              Icon(PhosphorIconsFill.checkCircle, size: 20, color: now ? c.textPrimary : c.textSecondary),
              const SizedBox(width: AurumSpace.s4),
              Text('$percent%', style: context.aurumText(AurumType.footnote, tabularFigures: true)),
            ],
          ),
          const SizedBox(height: AurumSpace.s12),
          Row(
            children: [
              AurumGlass(
                level: AurumMaterialLevel.clear,
                radius: 14,
                padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s12, vertical: AurumSpace.s4),
                child: Text(time, style: context.aurumText(AurumType.caption, tabularFigures: true)),
              ),
              const Spacer(),
              _MoreLink(lessons),
            ],
          ),
        ],
      ),
    );
    return later ? Opacity(opacity: 0.55, child: card) : card;
  }
}

/// "Continue ›": a text action with a trailing caret, for the corner of a cover.
class _ContinueLink extends StatefulWidget {
  const _ContinueLink({required this.onPressed});
  final VoidCallback onPressed;

  @override
  State<_ContinueLink> createState() => _ContinueLinkState();
}

class _ContinueLinkState extends State<_ContinueLink> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Semantics(
      button: true,
      label: 'Continue course',
      excludeSemantics: true,
      onTap: widget.onPressed,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        onTap: widget.onPressed,
        child: AurumPressScale(
          pressed: _pressed,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: AurumSize.target),
            child: Padding(
              padding: const EdgeInsetsDirectional.only(start: AurumSpace.s8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      'Continue',
                      style: context.aurumText(AurumType.subhead, color: c.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: AurumSpace.s4),
                  Icon(PhosphorIconsBold.caretRight, size: 14, color: c.textPrimary),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
