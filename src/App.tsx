/**
 * Top-level routing. Screens are code-split; the dev pages only exist in dev builds.
 */
import { lazy, Suspense, useEffect } from 'react';
import { navigate, useRoute } from './ui/router';
import { useAppState } from './state/store';
import { AppShell } from './ui/AppShell';
import { t } from './i18n/hu';
import { ToastHost } from './ui/Toast';
import { SOCIAL_CONFIGURED } from './social/config';

const Onboarding = lazy(() => import('./screens/Onboarding'));
const MapScreen = lazy(() => import('./screens/MapScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const FriendsScreen = lazy(() => import('./screens/FriendsScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const LessonScreen = lazy(() => import('./lesson/LessonScreen'));
const DailyScreen = lazy(() => import('./lesson/DailyScreen'));
const DevScreen = import.meta.env.DEV ? lazy(() => import('./dev/DevScreen')) : null;
const GalleryScreen = import.meta.env.DEV ? lazy(() => import('./dev/GalleryScreen')) : null;
const PreviewScreen = import.meta.env.DEV ? lazy(() => import('./dev/PreviewScreen')) : null;

function useThemeClasses() {
  const settings = useAppState((s) => s.settings);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#0f0c1d' : '#6c4bcc');
    root.classList.toggle('reduce-motion', settings.reduceMotion);
  }, [settings.theme, settings.reduceMotion]);
}

export function App() {
  useThemeClasses();
  useEffect(() => {
    if (!SOCIAL_CONFIGURED) return;
    let cleanup: (() => void) | undefined;
    void import('./social/sync')
      .then((m) => {
        cleanup = m.initSocialSync();
      })
      .catch(() => {});
    return () => cleanup?.();
  }, []);
  const route = useRoute();
  const grade = useAppState((s) => s.grade);

  // No grade chosen yet → onboarding (dev pages stay reachable).
  const needsOnboarding = grade === null && !route.name.startsWith('dev') && route.name !== 'welcome';
  useEffect(() => {
    if (needsOnboarding) navigate({ name: 'welcome' }, true);
  }, [needsOnboarding]);

  let screen: JSX.Element | null = null;
  let chrome = true;
  switch (route.name) {
    case 'welcome':
      screen = <Onboarding />;
      chrome = false;
      break;
    case 'map':
      screen = grade === null ? null : <MapScreen grade={grade} />;
      break;
    case 'lesson':
      screen = <LessonScreen subtopicId={route.subtopicId} />;
      chrome = false;
      break;
    case 'daily':
      screen = grade === null ? null : <DailyScreen grade={grade} />;
      chrome = false;
      break;
    case 'profile':
      screen = <ProfileScreen />;
      break;
    case 'friends':
      screen = <FriendsScreen />;
      break;
    case 'settings':
      screen = <SettingsScreen />;
      break;
    case 'dev':
      screen = DevScreen ? <DevScreen /> : null;
      chrome = false;
      break;
    case 'devGallery':
      screen = GalleryScreen ? <GalleryScreen /> : null;
      chrome = false;
      break;
    case 'devPreview':
      screen = PreviewScreen ? <PreviewScreen subtopicId={route.subtopicId} /> : null;
      chrome = false;
      break;
    case 'notFound':
      screen = null;
      break;
  }
  if (!screen && grade !== null && !needsOnboarding) {
    // unknown route or dev page in production → back to the map
    queueMicrotask(() => navigate({ name: 'map' }, true));
  }

  const content = <Suspense fallback={<div className="page muted">{t.common.loading}</div>}>{screen}</Suspense>;
  return (
    <>
      {chrome ? <AppShell route={route}>{content}</AppShell> : content}
      <ToastHost />
    </>
  );
}
