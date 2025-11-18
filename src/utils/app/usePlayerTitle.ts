/**
 * @file `usePlayerTitle.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import * as React from 'react';
import { useShowdexBundles } from '@showdex/redux/store';
import { findPlayerTitle } from './findPlayerTitle';

export const usePlayerTitle = (
  name: string,
  config?: Partial<Parameters<typeof findPlayerTitle>[1]>,
) => {
  const bundles = useShowdexBundles();

  const titles = React.useMemo(() => [
    ...(bundles?.titles || []),
    ...(config?.titles || []),
  ], [
    bundles?.titles,
    config?.titles,
  ]);

  const tiers = React.useMemo(() => [
    ...(bundles?.tiers || []),
    ...(config?.tiers || []),
  ], [
    bundles?.tiers,
    config?.tiers,
  ]);

  return React.useMemo(() => findPlayerTitle(name, {
    ...config,
    titles,
    tiers,
  }), [
    config,
    name,
    tiers,
    titles,
  ]);
};
