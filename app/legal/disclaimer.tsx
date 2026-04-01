import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useLanguage } from '@/lib/language';

export default function DisclaimerScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const copy = language === 'es'
    ? {
        eyebrow: 'Legal',
        title: 'Disclaimer financiero',
        body: 'DineralFlow no es un broker ni un asesor financiero. Los porcentajes de confianza describen la conviccion del modelo sobre el snapshot publicado, no una probabilidad de beneficio.',
        points: [
          'La app no ejecuta operaciones ni recomienda decisiones personalizadas.',
          'El contenido es informativo y puede llegar con retraso respecto a la publicacion original de la fuente.',
          'Antes de tomar decisiones financieras, debes contrastar la informacion y buscar asesoramiento independiente si hace falta.',
        ],
        back: 'Volver',
      }
    : {
        eyebrow: 'Legal',
        title: 'Financial disclaimer',
        body: 'DineralFlow is not a broker or investment adviser. Confidence percentages describe model conviction about the published snapshot, not a probability of profit.',
        points: [
          'The app does not execute trades or provide personalised recommendations.',
          'Content is informational and may lag the original source publication schedule.',
          'Before making financial decisions, users should verify the information and seek independent advice when needed.',
        ],
        back: 'Back',
      };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <LanguageSwitcher />
      </View>

      <SectionCard eyebrow={copy.eyebrow} title={copy.title} body={copy.body} variant="contrast">
        <View style={styles.list}>
          {copy.points.map((point) => (
            <Text key={point} style={styles.item}>
              - {point}
            </Text>
          ))}
        </View>
        <ActionButton label={copy.back} icon="arrow.right" onPress={() => router.back()} />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 36,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  list: {
    gap: 10,
  },
  item: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
