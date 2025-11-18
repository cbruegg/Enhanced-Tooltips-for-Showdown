/**
 * @file `saveNotedex.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { type NotedexSliceInstance, type NotedexSliceState } from '@showdex/redux/store';
import { logger, runtimer } from '@showdex/utils/debug';
import { writeNotesDb } from '@showdex/utils/storage';

export interface SaveNotedexPayload {
  id: string;
}

export const SaveNotedexActionType = 'notedex:save' as const;

const l = logger('@showdex/redux/actions/saveNotedex()');

/**
 * Saves the provided `NotedexSliceInstance` to the IndexedDB notes store.
 *
 * @since 1.3.0
 */
export const saveNotedex = createAsyncThunk<NotedexSliceInstance, SaveNotedexPayload>(
  SaveNotedexActionType,
  async (payload, api) => {
    const endTimer = runtimer(l.scope, l);
    const { id } = payload || {};

    if (!id) {
      endTimer('(bad args)');

      return null;
    }

    const rootState = api.getState() as Record<'notedex', NotedexSliceState>;
    const note = rootState?.notedex?.notes?.[id];

    if (!note?.id) {
      endTimer('(bad note)');

      return null;
    }

    const saved = await writeNotesDb(note);

    endTimer(
      '(dispatched)',
      '\n', 'id', id, 'saved', saved,
    );

    return { ...note, saved };
  },
);
