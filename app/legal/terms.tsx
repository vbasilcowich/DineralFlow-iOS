import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useLanguage } from '@/lib/language';

export default function TermsScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const copy = language === 'es'
    ? {
        eyebrow: 'Legal',
        title: 'Terminos de uso',
        body: 'DineralFlow es una herramienta informativa y analitica. No ofrece asesoramiento financiero personalizado ni ejecuta operaciones. El contenido puede cambiar con el tiempo y depende de snapshots guardados y de fuentes externas.',
        points: [
          'No garantizamos disponibilidad continua, exactitud absoluta ni ausencia de retrasos.',
          'Las fuentes de datos pueden tener limitaciones, pausas o revisiones posteriores.',
          'El usuario debe verificar que el contenido encaja con su caso antes de tomar decisiones.',
        ],
        back: 'Volver',
      }
    : {
        eyebrow: 'Legal',
        title: 'Terms of use',
        body: 'DineralFlow is an informational and analytical tool. It does not provide personalised financial advice or execute trades. Content can change over time and depends on stored snapshots and external sources.',
        points: [
          'We do not guarantee continuous availability, perfect accuracy, or zero delay.',
          'Data sources may have limitations, outages, or later revisions.',
          'Users should verify that the content fits their own situation before making decisions.',
        ],
        back: 'Back',
      };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
    paddingBottom: APP_DOCK_SCREEN_SPACER,
    gap: 18,
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
