/**
 * @file `useDurationFormatter.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { formatId } from '@showdex/utils/core';

/**
 * basically that "quick 'n dirty" `savedAgo` logic but refactored here cause I need it for the Notedex save button lol
 *
 * @since 1.3.0
 */
export const useDurationFormatter = (): ((timestamp: number) => string) => {
  const { t } = useTranslation('common');

  return React.useCallback<ReturnType<typeof useDurationFormatter>>((
    timestamp,
  ) => {
    if (!timestamp) {
      return null;
    }

    const raw = formatDistanceToNow(timestamp)?.replace('about ', '');
    const [, distGroup, unitGroup] = /([.,\d]+)?\s+([a-z]+[^s])s?$/i.exec(raw) || [];

    if (!distGroup || !unitGroup) {
      return raw;
    }

    const distValue = parseInt(distGroup, 10) || 0;
    const distUnit = formatId(unitGroup);

    if (!distValue || !distUnit) {
      return raw;
    }

    const distUnitLabel = t(`time.${distUnit}`, { count: distValue });

    if (!distUnitLabel) {
      return raw;
    }

    return `${distValue} ${distUnitLabel}`;
  }, [
    t,
  ]);
};
