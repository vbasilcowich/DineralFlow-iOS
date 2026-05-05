import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useLanguage } from '@/lib/language';
import { backOrReplace } from '@/lib/router-safe';

export default function SourcesScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const copy = language === 'es'
    ? {
        eyebrow: 'Legal',
        title: 'Fuentes y atribucion',
        body: 'La app prioriza lecturas programadas apoyadas en fuentes publicas o faciles de atribuir. La mezcla puede cambiar con el tiempo y siempre debe mostrarse junto con frescura y procedencia.',
        points: [
          'FRED aporta series macroeconomicas y exige enlazar sus terminos cuando se redistribuye una app basada en su API.',
          'EIA aporta datos publicos de energia reutilizados con atribucion de fuente.',
          'ECB y World Bank pueden aparecer cuando la lectura necesita contexto macro adicional.',
        ],
        back: 'Volver',
      }
    : {
        eyebrow: 'Legal',
        title: 'Sources and attribution',
        body: 'The app prioritises scheduled snapshots backed by public or attribution-friendly sources. The source mix can evolve over time and should always be shown together with freshness and provenance.',
        points: [
          'FRED contributes macroeconomic series and requires its API terms to be linked when an app redistributes its data.',
          'EIA contributes public energy data reused with source attribution.',
          'ECB and World Bank may appear when the reading needs additional macro context.',
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
        <ActionButton label={copy.back} icon="arrow.right" onPress={() => backOrReplace(router, '/paywall')} />
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
