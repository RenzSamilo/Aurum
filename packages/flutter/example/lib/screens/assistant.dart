import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

import 'common.dart';

const _assistant = 'Sage';
const _user = 'Renz Samilo';

/// The assistant's mark and version, as a pill that opens a model picker.
class _ModelPicker extends StatelessWidget {
  const _ModelPicker();

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Semantics(
      button: true,
      label: '$_assistant 1.7, change model',
      excludeSemantics: true,
      onTap: () {},
      child: GestureDetector(
        onTap: () {},
        child: Container(
          height: 44,
          padding: const EdgeInsetsDirectional.only(start: AurumSpace.s4, end: AurumSpace.s12),
          decoration: ShapeDecoration(
            color: c.surfaceCard,
            shape: StadiumBorder(side: BorderSide(color: c.borderDecorative)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconDisc(icon: PhosphorIconsFill.leaf, background: c.inverse, foreground: c.accentSecondary, size: 36),
              const SizedBox(width: AurumSpace.s8),
              Text('$_assistant 1.7', style: context.aurumText(AurumType.subhead)),
              const SizedBox(width: AurumSpace.s4),
              Icon(PhosphorIconsRegular.caretDown, size: AurumSize.iconSm, color: c.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Home

class AssistantHome extends StatelessWidget {
  const AssistantHome({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s8, AurumSpace.s16, AurumSpace.s32),
          children: [
            Row(
              children: [
                const _ModelPicker(),
                const Spacer(),
                Semantics(
                  button: true,
                  label: 'Plans',
                  excludeSemantics: true,
                  onTap: () => openPage(context, const AssistantPlans()),
                  child: GestureDetector(
                    onTap: () => openPage(context, const AssistantPlans()),
                    child: const AurumAvatar(name: _user, size: 44),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AurumSpace.s32),
            Text('Hello Renz', style: context.aurumText(AurumType.page)),
            const SizedBox(height: AurumSpace.s4),
            Text(
              'Make your day easier with $_assistant',
              style: context.aurumText(AurumType.subhead, color: c.textSecondary),
            ),
            const SizedBox(height: AurumSpace.s24),
            SizedBox(
              height: 300,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: _Tile(
                      color: c.accentSoft,
                      icon: PhosphorIconsRegular.microphone,
                      title: 'Talk with $_assistant',
                      subtitle: 'Try it now',
                      big: true,
                      onPressed: () => openPage(context, const AssistantChat()),
                    ),
                  ),
                  const SizedBox(width: AurumSpace.s12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Positioned.fill(
                                child: _Tile(
                                  color: c.secondarySoft,
                                  icon: PhosphorIconsRegular.chatCircle,
                                  title: 'New chat',
                                  onPressed: () => openPage(context, const AssistantChat()),
                                ),
                              ),
                              const PositionedDirectional(
                                top: -6,
                                end: AurumSpace.s12,
                                child: AurumBadge(
                                  label: 'New',
                                  tone: AurumBadgeTone.danger,
                                  style: AurumBadgeStyle.solid,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AurumSpace.s12),
                        Expanded(
                          child: _Tile(
                            color: c.inverse,
                            foreground: c.onInverse,
                            icon: PhosphorIconsRegular.scan,
                            title: 'Search by image',
                            onPressed: () {},
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AurumSpace.s24),
            const SectionHeader(title: 'Recent', action: 'See all'),
            const SizedBox(height: AurumSpace.s8),
            AurumListSection(
              children: [
                for (final (icon, text) in [
                  (PhosphorIconsRegular.leaf, 'Which herbs grow in shade?'),
                  (PhosphorIconsRegular.scan, 'Scanning a receipt'),
                  (PhosphorIconsRegular.chatCircle, 'Review my landing page'),
                  (PhosphorIconsRegular.bookOpen, 'Summarise chapter three'),
                ])
                  AurumListRow(
                    leading: icon,
                    title: text,
                    trailing: AurumButton(
                      icon: PhosphorIconsBold.dotsThree,
                      semanticLabel: 'More for $text',
                      variant: AurumButtonVariant.plain,
                      size: AurumButtonSize.sm,
                      onPressed: () {},
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.color,
    required this.icon,
    required this.title,
    required this.onPressed,
    this.subtitle,
    this.foreground,
    this.big = false,
  });

  final Color color;
  final Color? foreground;
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool big;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final fg = foreground ?? c.textPrimary;
    return AurumCard(
      color: color,
      lifted: false,
      padding: const EdgeInsets.all(AurumSpace.s16),
      semanticLabel: subtitle == null ? title : '$title. $subtitle',
      onPressed: onPressed,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconDisc(icon: icon, background: fg.withValues(alpha: 0.08), foreground: fg, size: big ? 48 : 36),
          const Spacer(),
          // Flexible + ellipsis keeps narrow phones and large text from overflowing.
          Flexible(
            child: Text(
              title,
              style: context.aurumText(big ? AurumType.card : AurumType.headline, color: fg),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: AurumSpace.s4),
            Text(subtitle!, style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Chat

class AssistantChat extends StatefulWidget {
  const AssistantChat({super.key});

  @override
  State<AssistantChat> createState() => _AssistantChatState();
}

class _AssistantChatState extends State<AssistantChat> {
  final _text = TextEditingController();

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16),
              child: AurumTopBar(
                leading: const AurumBackButton(),
                title: const _ModelPicker(),
                trailing: [
                  AurumButton(
                    icon: PhosphorIconsBold.dotsThree,
                    semanticLabel: 'Chat options',
                    variant: AurumButtonVariant.gray,
                    capsule: true,
                    onPressed: () {},
                  ),
                ],
              ),
            ),
            Expanded(
              child: Stack(
                children: [
                  ListView(
                    padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s16, AurumSpace.s16, AurumSpace.s24),
                    children: [
                      Center(
                        child: AurumBadge(label: 'Today', tone: AurumBadgeTone.neutral),
                      ),
                      const SizedBox(height: AurumSpace.s16),
                      _Sender(
                        name: 'Me',
                        end: true,
                        mark: const AurumAvatar(name: _user, size: 20),
                      ),
                      _Bubble(
                        end: true,
                        color: c.accentSoft,
                        child: Text(
                          'How much rain did the city get each quarter this year?',
                          style: context.aurumText(AurumType.subhead),
                        ),
                      ),
                      _Time(label: '1 min ago', end: true),
                      const SizedBox(height: AurumSpace.s12),
                      _Sender(
                        name: _assistant,
                        mark: IconDisc(
                          icon: PhosphorIconsFill.leaf,
                          background: c.inverse,
                          foreground: c.accentSecondary,
                          size: 20,
                        ),
                      ),
                      _Bubble(
                        color: c.surfaceCard,
                        child: Text(
                          "Here's the rainfall for each quarter so far:",
                          style: context.aurumText(AurumType.subhead),
                        ),
                      ),
                      const SizedBox(height: AurumSpace.s8),
                      const Align(alignment: AlignmentDirectional.centerStart, child: _RainCard()),
                      _Time(label: 'Just now'),
                    ],
                  ),
                  PositionedDirectional(end: AurumSpace.s16, bottom: AurumSpace.s8, child: _ToolRail()),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s4, AurumSpace.s16, AurumSpace.s8),
              child: AurumTextField(
                label: 'Message $_assistant',
                placeholder: 'Ask anything…',
                controller: _text,
                capsule: true,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                trailing: AurumButton(
                  icon: PhosphorIconsBold.plus,
                  semanticLabel: 'Add',
                  capsule: true,
                  onPressed: () {},
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Sender extends StatelessWidget {
  const _Sender({required this.name, required this.mark, this.end = false});
  final String name;
  final Widget mark;
  final bool end;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: AurumSpace.s8),
    child: Row(
      mainAxisAlignment: end ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: [
        ExcludeSemantics(child: mark),
        const SizedBox(width: AurumSpace.s8),
        Text(name, style: context.aurumText(AurumType.caption, color: context.aurum.textSecondary)),
      ],
    ),
  );
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.color, required this.child, this.end = false});
  final Color color;
  final Widget child;
  final bool end;

  @override
  Widget build(BuildContext context) {
    final r = Radius.circular(context.aurumRadii.lg);
    const tail = Radius.circular(6);
    return Align(
      alignment: end ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 280),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16, vertical: AurumSpace.s12),
          decoration: ShapeDecoration(
            color: color,
            shape: RoundedSuperellipseBorder(
              borderRadius: BorderRadiusDirectional.only(
                topStart: end ? r : tail,
                topEnd: end ? tail : r,
                bottomStart: r,
                bottomEnd: r,
              ).resolve(Directionality.of(context)),
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}

class _Time extends StatelessWidget {
  const _Time({required this.label, this.end = false});
  final String label;
  final bool end;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: AurumSpace.s4),
    child: Align(
      alignment: end ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: Text(label, style: context.aurumText(AurumType.caption, color: context.aurum.textSecondary)),
    ),
  );
}

class _RainCard extends StatelessWidget {
  const _RainCard();

  static const _quarters = [('Q1', 0.42), ('Q2', 0.71), ('Q3', 1.0), ('Q4', 0.64)];

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return SizedBox(
      width: 260,
      child: AurumCard(
        lifted: false,
        padding: const EdgeInsets.all(AurumSpace.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('2026 so far', style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
            Text('1,284 mm', style: context.aurumText(AurumType.section, tabularFigures: true)),
            const SizedBox(height: AurumSpace.s16),
            Semantics(
              label: 'Rainfall by quarter: Q1 228 mm, Q2 386 mm, Q3 544 mm, Q4 126 mm so far',
              excludeSemantics: true,
              child: SizedBox(
                height: 120,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    for (var i = 0; i < _quarters.length; i++) ...[
                      if (i > 0) const SizedBox(width: AurumSpace.s8),
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Expanded(
                              child: FractionallySizedBox(
                                heightFactor: _quarters[i].$2,
                                alignment: Alignment.bottomCenter,
                                child: Container(
                                  decoration: ShapeDecoration(
                                    color: i.isEven ? c.secondarySoft : c.accentSoft,
                                    shape: const StadiumBorder(),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: AurumSpace.s4),
                            Text(_quarters[i].$1, style: context.aurumText(AurumType.micro, color: c.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ToolRail extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    Widget tool(IconData icon, String label) => Semantics(
      button: true,
      label: label,
      excludeSemantics: true,
      onTap: () {},
      child: GestureDetector(
        onTap: () {},
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(shape: BoxShape.circle, color: c.onInverse.withValues(alpha: 0.12)),
          child: Icon(icon, size: AurumSize.iconSm, color: c.onInverse),
        ),
      ),
    );
    return Container(
      padding: const EdgeInsets.all(AurumSpace.s4),
      decoration: ShapeDecoration(color: c.inverse, shape: const StadiumBorder(), shadows: AurumShadow.level2),
      child: Column(
        children: [
          tool(PhosphorIconsRegular.image, 'Attach image'),
          const SizedBox(height: AurumSpace.s4),
          tool(PhosphorIconsRegular.camera, 'Take photo'),
          const SizedBox(height: AurumSpace.s4),
          tool(PhosphorIconsRegular.microphone, 'Dictate'),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Plans

class AssistantPlans extends StatefulWidget {
  const AssistantPlans({super.key});

  @override
  State<AssistantPlans> createState() => _AssistantPlansState();
}

class _AssistantPlansState extends State<AssistantPlans> {
  int _plan = 1;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: AurumSpace.s16),
              child: AurumTopBar(leading: AurumBackButton()),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16),
                children: [
                  const SizedBox(height: AurumSpace.s8),
                  Center(
                    child: Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.bottomCenter,
                      children: [
                        IconDisc(
                          icon: PhosphorIconsFill.leaf,
                          background: c.inverse,
                          foreground: c.accentSecondary,
                          size: 80,
                        ),
                        const Positioned(
                          bottom: -10,
                          child: AurumBadge(label: 'Pro', tone: AurumBadgeTone.secondary, style: AurumBadgeStyle.solid),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AurumSpace.s24),
                  Text('$_assistant+ plans', textAlign: TextAlign.center, style: context.aurumText(AurumType.page)),
                  const SizedBox(height: AurumSpace.s4),
                  Text(
                    'Unlimited chats and smarter reminders',
                    textAlign: TextAlign.center,
                    style: context.aurumText(AurumType.subhead, color: c.textSecondary),
                  ),
                  const SizedBox(height: AurumSpace.s24),
                  _PlanCard(
                    title: 'Monthly',
                    price: r'$8.99 / month',
                    color: c.accentSoft,
                    icon: PhosphorIconsFill.plant,
                    selected: _plan == 0,
                    onPressed: () => setState(() => _plan = 0),
                  ),
                  const SizedBox(height: AurumSpace.s12),
                  _PlanCard(
                    title: 'Yearly',
                    price: r'$79.99 / year, 2 months free',
                    color: c.secondarySoft,
                    icon: PhosphorIconsFill.sparkle,
                    selected: _plan == 1,
                    onPressed: () => setState(() => _plan = 1),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AurumSpace.s16),
              child: AurumButton(
                label: _plan == 0 ? r'Subscribe for $8.99' : r'Subscribe for $79.99',
                size: AurumButtonSize.lg,
                capsule: true,
                fullWidth: true,
                haptic: AurumHaptic.resultSuccess,
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.title,
    required this.price,
    required this.color,
    required this.icon,
    required this.selected,
    required this.onPressed,
  });

  final String title;
  final String price;
  final Color color;
  final IconData icon;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    Widget perk(String text) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(PhosphorIconsFill.checkCircle, size: AurumSize.iconSm, color: c.accent),
        const SizedBox(width: AurumSpace.s4),
        Text(text, style: context.aurumText(AurumType.footnote)),
      ],
    );
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: selected,
      child: DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: ShapeDecoration(
          shape: RoundedSuperellipseBorder(
            borderRadius: BorderRadius.circular(context.aurumRadii.lg),
            side: BorderSide(color: selected ? c.accent : const Color(0x00000000), width: 2),
          ),
        ),
        child: AurumCard(
          color: color,
          lifted: false,
          padding: const EdgeInsets.all(AurumSpace.s16),
          semanticLabel: '$title plan, $price. Unlimited chats. Smart reminders. No ads.',
          onPressed: onPressed,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconDisc(icon: icon, background: c.inverse, foreground: c.accentSecondary, size: 44),
                  const SizedBox(width: AurumSpace.s12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: context.aurumText(AurumType.headline)),
                        Text(price, style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
                      ],
                    ),
                  ),
                  const AurumBadge(label: 'No ads', style: AurumBadgeStyle.outline),
                ],
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AurumSpace.s12),
                child: Container(height: 1, color: c.textPrimary.withValues(alpha: 0.1)),
              ),
              Wrap(
                spacing: AurumSpace.s16,
                runSpacing: AurumSpace.s8,
                children: [perk('Unlimited chats'), perk('Smart reminders')],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
