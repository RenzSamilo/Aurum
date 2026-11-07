import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

import 'common.dart';

const _app = 'Ledger';
const _user = 'Renz Samilo';

/// The money app shell: three tabs and the tab bar.
class MoneyApp extends StatefulWidget {
  const MoneyApp({super.key, this.initialTab = 0});
  final int initialTab;

  @override
  State<MoneyApp> createState() => _MoneyAppState();
}

class _MoneyAppState extends State<MoneyApp> {
  late int _tab = widget.initialTab;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      const AurumTab(icon: PhosphorIconsRegular.house, selectedIcon: PhosphorIconsFill.house, label: 'Home'),
      const AurumTab(icon: PhosphorIconsRegular.mapTrifold, selectedIcon: PhosphorIconsFill.mapTrifold, label: 'Map'),
      const AurumTab(
        icon: PhosphorIconsRegular.arrowsLeftRight,
        selectedIcon: PhosphorIconsBold.arrowsLeftRight,
        label: 'Transfer',
      ),
      const AurumTab(icon: PhosphorIconsRegular.gear, selectedIcon: PhosphorIconsFill.gear, label: 'Settings'),
      const AurumTab(
        icon: PhosphorIconsRegular.user,
        label: 'Profile',
        child: AurumAvatar(name: _user, size: 24),
      ),
    ];
    final body = switch (_tab) {
      0 => const MoneyHome(),
      4 => const MoneyProfile(),
      _ => _Empty(label: tabs[_tab].label),
    };
    return Scaffold(
      extendBody: true,
      body: body,
      bottomNavigationBar: AurumTabBar(tabs: tabs, selectedIndex: _tab, onSelected: (i) => setState(() => _tab = i)),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Center(
    child: Text('$label goes here', style: context.aurumText(AurumType.body, color: context.aurum.textSecondary)),
  );
}

// ---------------------------------------------------------------------------
// Bank card

class BankCard extends StatelessWidget {
  const BankCard({super.key, required this.kind, required this.last4, this.dark = false, this.onDetails});

  final String kind;
  final String last4;
  final bool dark;
  final VoidCallback? onDetails;

  static const double width = 220;
  static const double height = 140;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final bg = dark ? c.inverse : Color.alphaBlend(c.accentSecondary.withValues(alpha: 0.55), c.surfaceCard);
    final fg = dark ? c.onInverse : c.textPrimary;
    final r = BorderRadius.circular(context.aurumRadii.lg);
    return Semantics(
      container: true,
      label: '$kind ending in $last4',
      child: ClipRSuperellipse(
        borderRadius: r,
        child: Container(
          width: width,
          height: height,
          color: bg,
          child: Stack(
            children: [
              // Faint repeated wordmark, like an engraved card face.
              Positioned.fill(
                child: ExcludeSemantics(
                  child: OverflowBox(
                    maxWidth: width * 2,
                    maxHeight: height * 2,
                    child: Transform.rotate(
                      angle: -0.18,
                      child: Wrap(
                        spacing: 6,
                        children: [
                          for (var i = 0; i < 40; i++)
                            Text(
                              _app.toUpperCase(),
                              style: context
                                  .aurumText(AurumType.headline, color: fg.withValues(alpha: 0.05))
                                  .copyWith(fontWeight: FontWeight.w800),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AurumSpace.s12),
                child: ExcludeSemantics(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('L.', style: context.aurumText(AurumType.section, color: fg)),
                          const Spacer(),
                          Icon(PhosphorIconsRegular.creditCard, color: fg, size: AurumSize.iconMd),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  kind,
                                  style: context.aurumText(AurumType.caption, color: fg.withValues(alpha: 0.8)),
                                ),
                                Text(
                                  '•••• $last4',
                                  style: context.aurumText(AurumType.subhead, color: fg, tabularFigures: true),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              if (onDetails != null)
                PositionedDirectional(
                  end: AurumSpace.s8,
                  bottom: 0,
                  child: Theme(
                    data: Theme.of(context),
                    child: AurumButton(
                      label: 'Details',
                      icon: PhosphorIconsRegular.eye,
                      variant: AurumButtonVariant.gray,
                      size: AurumButtonSize.sm,
                      capsule: true,
                      onPressed: onDetails,
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

// ---------------------------------------------------------------------------
// Home

class MoneyHome extends StatefulWidget {
  const MoneyHome({super.key});

  @override
  State<MoneyHome> createState() => _MoneyHomeState();
}

class _MoneyHomeState extends State<MoneyHome> {
  bool _hidden = false;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s16, AurumSpace.s16, 120),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Good morning, Renz', style: context.aurumText(AurumType.headline)),
                    Text('Welcome to $_app', style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
                  ],
                ),
              ),
              Stack(
                children: [
                  AurumButton(
                    icon: PhosphorIconsRegular.bell,
                    semanticLabel: 'Notifications, 1 new',
                    variant: AurumButtonVariant.gray,
                    onPressed: () {},
                  ),
                  PositionedDirectional(
                    top: 10,
                    end: 12,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: c.danger,
                        border: Border.all(color: c.surfaceInset, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AurumSpace.s16),
          AurumCard(
            padding: const EdgeInsets.all(AurumSpace.s16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Your balance', style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
                Row(
                  children: [
                    Expanded(
                      child: Semantics(
                        label: _hidden ? 'Balance hidden' : r'Balance $3,200.00',
                        excludeSemantics: true,
                        child: Text(
                          _hidden ? '••••••' : r'$3,200.00',
                          style: context.aurumText(AurumType.page, tabularFigures: true),
                        ),
                      ),
                    ),
                    AurumButton(
                      icon: _hidden ? PhosphorIconsRegular.eye : PhosphorIconsRegular.eyeSlash,
                      semanticLabel: _hidden ? 'Show balance' : 'Hide balance',
                      variant: AurumButtonVariant.plain,
                      onPressed: () => setState(() => _hidden = !_hidden),
                    ),
                  ],
                ),
                const SizedBox(height: AurumSpace.s12),
                AurumButton(
                  label: 'Add money',
                  capsule: true,
                  fullWidth: true,
                  onPressed: () => openPage(context, const MoneyAdd()),
                ),
              ],
            ),
          ),
          const SizedBox(height: AurumSpace.s24),
          SectionHeader(title: 'Your cards', action: 'New card', actionIcon: PhosphorIconsBold.plus),
          const SizedBox(height: AurumSpace.s8),
          SizedBox(
            height: BankCard.height,
            child: ListView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              children: [
                BankCard(kind: 'Debit card', last4: '4568', onDetails: () {}),
                const SizedBox(width: AurumSpace.s12),
                const BankCard(kind: 'Credit card', last4: '2478', dark: true),
              ],
            ),
          ),
          const SizedBox(height: AurumSpace.s24),
          AurumCard(
            padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s8, AurumSpace.s8, AurumSpace.s8),
            child: Column(
              children: [
                const SectionHeader(title: 'Transactions', action: 'See all'),
                for (final (icon, name, time, amount, back) in [
                  (PhosphorIconsRegular.coffee, 'Corner Café', 'Today, 9:00 AM', r'−$4.80', r'+$0.15'),
                  (PhosphorIconsRegular.bookOpen, 'Paper & Ink Books', 'Yesterday, 6:12 PM', r'−$32.00', r'+$1.00'),
                  (PhosphorIconsRegular.storefront, 'Green Market', 'Oct 30, 11:40 AM', r'−$58.25', null),
                ])
                  _Transaction(icon: icon, name: name, when: time, amount: amount, cashback: back),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Transaction extends StatelessWidget {
  const _Transaction({required this.icon, required this.name, required this.when, required this.amount, this.cashback});

  final IconData icon;
  final String name;
  final String when;
  final String amount;
  final String? cashback;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return MergeSemantics(
      child: Padding(
        padding: const EdgeInsetsDirectional.only(top: AurumSpace.s12, bottom: AurumSpace.s4, end: AurumSpace.s8),
        child: Row(
          children: [
            IconDisc(icon: icon, background: c.accentSoft, foreground: c.accent, size: 44),
            const SizedBox(width: AurumSpace.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: context.aurumText(AurumType.subhead)),
                  Text(when, style: context.aurumText(AurumType.caption, color: c.textSecondary)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(amount, style: context.aurumText(AurumType.subhead, tabularFigures: true)),
                if (cashback != null) ...[const SizedBox(height: AurumSpace.s2), AurumBadge(label: '$cashback back')],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add money

class MoneyAdd extends StatefulWidget {
  const MoneyAdd({super.key});

  @override
  State<MoneyAdd> createState() => _MoneyAddState();
}

class _MoneyAddState extends State<MoneyAdd> {
  /// Gap plus ring around the selected card.
  static const double _ring = 5;
  int _card = 0;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final cards = [('Debit card', '4568', false), ('Credit card', '2478', true), ('Savings card', '9012', false)];
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16),
          children: [
            const AurumTopBar(leading: AurumBackButton(), titleText: 'Add money'),
            const SizedBox(height: AurumSpace.s8),
            Semantics(header: true, child: Text('Select card', style: context.aurumText(AurumType.card))),
            const SizedBox(height: AurumSpace.s12),
            SizedBox(
              height: BankCard.height + _ring * 2,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                clipBehavior: Clip.none,
                padding: EdgeInsets.zero,
                itemCount: cards.length,
                separatorBuilder: (_, _) => const SizedBox(width: AurumSpace.s12),
                itemBuilder: (context, i) {
                  final (kind, last4, dark) = cards[i];
                  final selected = i == _card;
                  return Semantics(
                    button: true,
                    selected: selected,
                    onTap: () => setState(() => _card = i),
                    child: GestureDetector(
                      onTap: () {
                        if (i != _card) AurumHaptics.play(AurumHaptic.selectionTick);
                        setState(() => _card = i);
                      },
                      // Selection: an accent ring with a gap, so it reads as a halo
                      // around the card rather than an outline on it, plus a check.
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          AnimatedContainer(
                            duration: AurumMotion.feedback,
                            curve: AurumMotion.easeStandard,
                            padding: const EdgeInsets.all(_ring),
                            decoration: ShapeDecoration(
                              shape: RoundedSuperellipseBorder(
                                borderRadius: BorderRadius.circular(context.aurumRadii.lg + _ring),
                                side: BorderSide(color: selected ? c.accent : const Color(0x00000000), width: 2),
                              ),
                            ),
                            child: BankCard(kind: kind, last4: last4, dark: dark),
                          ),
                          if (selected)
                            PositionedDirectional(
                              top: -2,
                              end: -2,
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: c.accent,
                                  border: Border.all(color: c.surfaceCanvas, width: 2),
                                ),
                                child: Icon(PhosphorIconsBold.check, size: 12, color: c.onAccent),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: AurumSpace.s24),
            Semantics(header: true, child: Text('Add money to $_app', style: context.aurumText(AurumType.card))),
            const SizedBox(height: AurumSpace.s12),
            AurumListSection(
              children: [
                AurumListRow(
                  leading: PhosphorIconsRegular.downloadSimple,
                  title: 'Move your direct deposit',
                  onPressed: () {},
                ),
                AurumListRow(leading: PhosphorIconsRegular.bank, title: 'Transfer from another bank', onPressed: () {}),
                AurumListRow(leading: PhosphorIconsRegular.wallet, title: 'Pay with a phone wallet', onPressed: () {}),
                AurumListRow(leading: PhosphorIconsRegular.creditCard, title: 'Debit or credit card', onPressed: () {}),
              ],
            ),
            const SizedBox(height: AurumSpace.s32),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Profile

class MoneyProfile extends StatefulWidget {
  const MoneyProfile({super.key});

  @override
  State<MoneyProfile> createState() => _MoneyProfileState();
}

class _MoneyProfileState extends State<MoneyProfile> {
  bool _alerts = true;
  bool _faceUnlock = false;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(AurumSpace.s16, 0, AurumSpace.s16, 120),
        children: [
          const AurumTopBar(titleText: 'Profile'),
          const SizedBox(height: AurumSpace.s8),
          Center(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                const AurumAvatar(name: _user, size: 112, ring: true),
                PositionedDirectional(
                  end: -8,
                  bottom: -8,
                  child: AurumButton(
                    icon: PhosphorIconsRegular.pencilSimple,
                    semanticLabel: 'Change photo',
                    variant: AurumButtonVariant.gray,
                    size: AurumButtonSize.sm,
                    capsule: true,
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AurumSpace.s24),
          AurumCard(
            padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s8, AurumSpace.s8, AurumSpace.s16),
            child: Column(
              children: [
                const SectionHeader(title: 'Personal info', action: 'Edit'),
                for (final (icon, label, value) in [
                  (PhosphorIconsRegular.user, 'Name', _user),
                  (PhosphorIconsRegular.envelopeSimple, 'Email', 'renz@example.com'),
                  (PhosphorIconsRegular.phone, 'Phone', '+63 900 000 0000'),
                  (PhosphorIconsRegular.mapPin, 'Address', '12 Acacia Lane, Quezon City'),
                ])
                  MergeSemantics(
                    child: Padding(
                      padding: const EdgeInsets.only(top: AurumSpace.s12),
                      child: Row(
                        children: [
                          Icon(icon, size: AurumSize.iconMd, color: c.textSecondary),
                          const SizedBox(width: AurumSpace.s12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(label, style: context.aurumText(AurumType.caption, color: c.textSecondary)),
                                Text(value, style: context.aurumText(AurumType.subhead)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AurumSpace.s24),
          AurumListSection(
            header: 'Account',
            children: [
              AurumListRow(
                leading: PhosphorIconsRegular.bell,
                title: 'Payment alerts',
                trailing: AurumSwitch(
                  value: _alerts,
                  semanticLabel: 'Payment alerts',
                  onChanged: (v) => setState(() => _alerts = v),
                ),
              ),
              AurumListRow(
                leading: PhosphorIconsRegular.scan,
                title: 'Face unlock',
                trailing: AurumSwitch(
                  value: _faceUnlock,
                  semanticLabel: 'Face unlock',
                  onChanged: (v) => setState(() => _faceUnlock = v),
                ),
              ),
              AurumListRow(title: 'Sign out', destructive: true, chevron: false, onPressed: () {}),
            ],
          ),
        ],
      ),
    );
  }
}
