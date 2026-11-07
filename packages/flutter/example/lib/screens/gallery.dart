import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

import 'assistant.dart';
import 'common.dart';
import 'money.dart';

/// Sample screens built only from Aurum parts, to test the template on real
/// layouts. Content is placeholder.
class SampleScreensSection extends StatelessWidget {
  const SampleScreensSection({super.key});

  @override
  Widget build(BuildContext context) => AurumListSection(
    header: 'Sample screens',
    footer: 'Two small apps built only from Aurum parts.',
    children: [
      AurumListRow(
        leading: PhosphorIconsRegular.leaf,
        title: 'Assistant: home',
        onPressed: () => openPage(context, const AssistantHome()),
      ),
      AurumListRow(
        leading: PhosphorIconsRegular.chatCircle,
        title: 'Assistant: chat',
        onPressed: () => openPage(context, const AssistantChat()),
      ),
      AurumListRow(
        leading: PhosphorIconsRegular.sparkle,
        title: 'Assistant: plans',
        onPressed: () => openPage(context, const AssistantPlans()),
      ),
      AurumListRow(
        leading: PhosphorIconsRegular.wallet,
        title: 'Money: home',
        onPressed: () => openPage(context, const MoneyApp()),
      ),
      AurumListRow(
        leading: PhosphorIconsRegular.plus,
        title: 'Money: add money',
        onPressed: () => openPage(context, const MoneyAdd()),
      ),
      AurumListRow(
        leading: PhosphorIconsRegular.user,
        title: 'Money: profile',
        onPressed: () => openPage(context, const MoneyApp(initialTab: 4)),
      ),
    ],
  );
}
