import React, { lazy as reactLazy } from 'react';

// After a deploy, open tabs may request old chunks that no longer exist. The
// vite:preloadError handler in index.tsx suppresses the error so it can reload
// or show a retry snackbar, which makes the import resolve to undefined.
// Returning a never-resolving promise keeps the Suspense fallback up instead
// of letting React.lazy throw into the error boundary.
const neverResolvingPromise = new Promise<never>(() => {});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazy = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => reactLazy(async () => (await factory()) ?? neverResolvingPromise);
