/**
 * Canonical origin for the app. Single source of truth for metadata, robots and
 * the sitemap, so they can never disagree with the links the UI actually builds.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
