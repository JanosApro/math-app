/**
 * Minimal hash router (#/path). Hash URLs work on any static host without server rewrites.
 *
 * Routes:
 *   #/                     map of the current grade (or onboarding if no grade chosen)
 *   #/welcome              onboarding / grade picker
 *   #/lesson/<subtopicId>  lesson player
 *   #/daily                daily challenge
 *   #/profile              XP, streak calendar, badges
 *   #/settings             settings, export/import
 *   #/dev                  developer page (dev builds only)
 *   #/dev/gallery          figure gallery (dev builds only)
 *   #/dev/preview/<id>     preview a subtopic, skipping the path (dev builds only)
 */
import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'map' }
  | { name: 'welcome' }
  | { name: 'lesson'; subtopicId: string }
  | { name: 'daily' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'dev' }
  | { name: 'devGallery' }
  | { name: 'devPreview'; subtopicId: string }
  | { name: 'notFound'; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'map' };
  switch (parts[0]) {
    case 'welcome':
      return { name: 'welcome' };
    case 'lesson':
      return parts[1] ? { name: 'lesson', subtopicId: parts[1] } : { name: 'map' };
    case 'daily':
      return { name: 'daily' };
    case 'profile':
      return { name: 'profile' };
    case 'settings':
      return { name: 'settings' };
    case 'dev':
      if (parts[1] === 'gallery') return { name: 'devGallery' };
      if (parts[1] === 'preview' && parts[2]) return { name: 'devPreview', subtopicId: parts[2] };
      return { name: 'dev' };
    default:
      return { name: 'notFound', path };
  }
}

export function routeToHash(r: Route): string {
  switch (r.name) {
    case 'map':
      return '#/';
    case 'welcome':
      return '#/welcome';
    case 'lesson':
      return `#/lesson/${encodeURIComponent(r.subtopicId)}`;
    case 'daily':
      return '#/daily';
    case 'profile':
      return '#/profile';
    case 'settings':
      return '#/settings';
    case 'dev':
      return '#/dev';
    case 'devGallery':
      return '#/dev/gallery';
    case 'devPreview':
      return `#/dev/preview/${encodeURIComponent(r.subtopicId)}`;
    case 'notFound':
      return '#/';
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

/** Current route; re-renders on navigation. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return parseRoute(hash);
}

/** Navigate to a route. `replace` avoids a new history entry (e.g. redirects). */
export function navigate(r: Route, replace = false): void {
  const hash = routeToHash(r);
  if (replace) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}
