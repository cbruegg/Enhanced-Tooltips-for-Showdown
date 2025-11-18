/**
 * @file `main.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

import {
  BootdexClassicAdapter,
  BootdexManager,
  BootdexPreactAdapter,
  CalcdexClassicBootstrapper,
  CalcdexPreactBootstrapper,
  HellodexClassicBootstrapper,
  HellodexPreactBootstrapper,
  HonkdexClassicBootstrapper,
  HonkdexPreactBootstrapper,
  NotedexClassicBootstrapper,
  NotedexPreactBootstrapper,
  TeamdexClassicBootstrapper,
  TeamdexPreactBootstrapper,
} from '@showdex/pages';
import { env } from '@showdex/utils/core';
import { logger, wtf } from '@showdex/utils/debug';
import { detectClassicHost, detectPreactHost } from '@showdex/utils/host';
import '@showdex/styles/global.scss';

// Provided by the enhanced-tooltips plugin (https://github.com/rowin1/Pokemon-Showdown-Enhanced-Tooltips)
require('./index');

// index-randbats.js can be obtained by downloading this XPI:
// https://addons.mozilla.org/en-US/firefox/addon/pkmn-randbats-tooltip/
// The index.js in it corresponds to index-randbats.js
// import 'script-loader!./index-randbats.js';
require('./index-randbats');

const l = logger('@showdex/main');

l.debug('Starting', env('build-name', 'showdex'));

// first gotta make sure we're in Showdown
if (
  typeof window?.Dex?.gen !== 'number'
    || typeof window.Dex.forGen !== 'function'
    || (
      typeof window.app?.receive !== 'function'
        && typeof window.PS?.startTime !== 'number'
    )
) {
  l.error(
    'main may have executed too fast or we\'re not in Showdown anymore...',
    '\n', 'window.Dex', '(typeof)', wtf(window?.Dex), window?.Dex,
    '\n', 'window.app', '(typeof)', wtf(window?.app), window?.app,
    '\n', 'window.PS', '(typeof)', wtf(window?.PS), window?.PS,
  );

  throw new Error('Showdex attempted to start in an unsupported website.');
}

// not sure when we'll run into this, but it's entirely possible now that standalone builds are a thing
if (window.__SHOWDEX_INIT) {
  l.error(
    'yo dawg I heard you wanted Showdex with your Showdex',
    '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
    '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
    '\n', 'BUILD_NAME', env('build-name'),
  );

  throw new Error('Another Showdex tried to load despite one already being loaded.');
}

// basically using this as a Showdex init mutex lock lol
window.__SHOWDEX_INIT = env('build-name', 'showdex');

// determine if we're in that new new preact mode or nahhhhh
// ("new" at the time of me writing this on 2025/08/08, anyway)
window.__SHOWDEX_HOST = (detectPreactHost(window) && 'preact')
  || (detectClassicHost(window) && 'classic')
  || null;

// note: don't inline await, otherwise, there'll be a race condition with the login
// (also makes the Hellodex not appear immediately when Showdown first opens)
void (async () => {
  switch (window.__SHOWDEX_HOST) {
    case 'preact': {
      l.silly(
        'welcome to Showdex for pre\'s react edition !!!',
        '\n', 'PS', '(typeof)', wtf(window.PS), '(start)', window.PS.startTime,
        '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
        '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
        '\n', '(note: no relation to @pre ... that was for the punies hehe)', // fun fact: puny + react = preact (punny huh)
      );

      BootdexManager.register('calcdex', CalcdexPreactBootstrapper);
      BootdexManager.register('hellodex', HellodexPreactBootstrapper);
      BootdexManager.register('honkdex', HonkdexPreactBootstrapper);
      BootdexManager.register('notedex', NotedexPreactBootstrapper);

      await BootdexPreactAdapter.run();
      new CalcdexPreactBootstrapper().run();
      new TeamdexPreactBootstrapper().run();
      new HellodexPreactBootstrapper().run();
      new HonkdexPreactBootstrapper().run();
      new NotedexPreactBootstrapper().run();

      break;
    }

    case 'classic': {
      BootdexManager.register('calcdex', CalcdexClassicBootstrapper);
      BootdexManager.register('hellodex', HellodexClassicBootstrapper);
      BootdexManager.register('honkdex', HonkdexClassicBootstrapper);
      BootdexManager.register('notedex', NotedexClassicBootstrapper);
      BootdexClassicAdapter.receiverFactory = (roomId) => () => void new CalcdexClassicBootstrapper(roomId).run();

      await BootdexClassicAdapter.run();
      new TeamdexClassicBootstrapper().run();
      new HellodexClassicBootstrapper().run();
      new HonkdexClassicBootstrapper().run();
      new NotedexClassicBootstrapper().run();

      break;
    }

    default: {
      l.error(
        'Couldn\'t determine what __SHOWDEX_HOST we\'re in rn o_O',
        '\n', '__SHOWDEX_HOST', window.__SHOWDEX_HOST,
        '\n', '__SHOWDEX_INIT', window.__SHOWDEX_INIT,
      );

      throw new Error('Showdex attempted to run in an unsupported Showdown host.');
    }
  }

  l.success(window.__SHOWDEX_INIT, 'for', window.__SHOWDEX_HOST, 'initialized!');
})();
