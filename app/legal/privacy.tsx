import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useLanguage } from '@/lib/language';

export default function PrivacyScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const copy = language === 'es'
    ? {
        eyebrow: 'Legal',
        title: 'Politica de privacidad',
        body: 'La app guarda en el dispositivo el idioma, la sesion autenticada y la ultima informacion de acceso para no perder contexto. Cuando el backend esta disponible, la cuenta y el estado premium se sincronizan de forma segura con la API autenticada.',
        points: [
          'No vendemos los datos personales del usuario.',
          'Guardamos localmente la sesion, el estado del paywall y la cache de lectura para mejorar la experiencia.',
          'En backend almacenamos el minimo necesario para operar la cuenta: email, hash de password, verificacion, sesiones y estado de acceso.',
          'Las herramientas analiticas o de email futuras se documentaran antes de activarlas.',
        ],
        back: 'Volver',
      }
    : {
        eyebrow: 'Legal',
        title: 'Privacy policy',
        body: 'The app stores language, authenticated session, and last access information on device so the experience keeps its context. When the backend is available, account and premium state sync securely through the authenticated API.',
        points: [
          'We do not sell personal user data.',
          'We store session, paywall state, and reading cache locally to improve the experience.',
          'On the backend we store the minimum needed to operate the account: email, password hash, verification state, sessions, and entitlement state.',
          'Any future analytics or email tools will be documented before activation.',
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
