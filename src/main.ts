import { calcdexBootstrapper, hellodexBootstrapper } from '@showdex/pages';
import { createStore, showdexSlice } from '@showdex/redux/store';
import { logger } from '@showdex/utils/debug';
import type { RootStore } from '@showdex/redux/store';
import '@showdex/styles/global.scss';
import { getQuickJS } from 'quickjs-emscripten';

// Provided by the enhanced-tooltips plugin (https://github.com/rowin1/Pokemon-Showdown-Enhanced-Tooltips)
require('./index');

// index-randbats.js can be obtained by downloading this XPI:
// https://addons.mozilla.org/en-US/firefox/addon/pkmn-randbats-tooltip/
// The index.js in it corresponds to index-randbats.js
// import 'script-loader!./index-randbats.js';
require('./index-randbats');

export type ShowdexBootstrapper = (
  store?: RootStore,
  data?: string,
  roomId?: string,
) => void;

async function main() {
  await getQuickJS();

  const l = logger('@showdex/main');

  if (typeof app === 'undefined' || typeof Dex === 'undefined') {
    l.error(
      'main may have executed too fast or',
      'we\'re not in Showdown anymore...',
    );

    throw new Error('Showdex attempted to start in an unsupported website.');
  }

  const store = createStore();

  // list of bootstrappers dependent on a room
  const bootstrappers: ShowdexBootstrapper[] = [
    calcdexBootstrapper,
  ];

  l.debug('Hooking into the client\'s app.receive()...');

  // make a binded copy of the original app.recieve()
  const appReceive = <typeof app.receive>app.receive.bind(app);

  app.receive = (data: string) => {
    const receivedRoom = data?.startsWith?.('>');

    if (receivedRoom) {
      const roomId = data.slice(1, data.indexOf('\n'));
      const room = app.rooms[roomId];

      l.debug(
        'receive() for', roomId,
        '\n', 'room', room,
        '\n', 'data', __DEV__ && { data },
      );

      // call each bootstrapper
      bootstrappers.forEach((bootstrapper) => bootstrapper(store, data, roomId));
    }

    // call the original function
    appReceive(data);
  };

  l.debug('Initializing MutationObserver for client colorScheme changes...');

  // create a MutationObserver to listen for class changes in the <html> tag
  // (in order to dispatch colorScheme updates to Redux)
  const colorSchemeObserver = new MutationObserver((mutationList) => {
    const [mutation] = mutationList || [];

    if (mutation?.type !== 'attributes') {
      return;
    }

    // determine the color scheme from the presence of a 'dark' class in <html>
    const { className } = (<typeof document.documentElement>mutation.target) || {};
    const colorScheme: Showdown.ColorScheme = className?.includes('dark') ? 'dark' : 'light';

    store.dispatch(showdexSlice.actions.setColorScheme(colorScheme));
  });

  // note: document.documentElement is a ref to the <html> tag
  colorSchemeObserver.observe(document.documentElement, {
    // observe only 'class' attribute on <html>
    attributes: true,
    attributeFilter: ['class'],

    // don't observe the <html>'s children or data
    childList: false,
    characterData: false,
  });

  // open the Hellodex when the Showdown client starts
  // (hence why it's not part of the bootstrappers array)
  hellodexBootstrapper(store);

  l.info('Completed main execution!');
}

main().catch((err) => console.error(err));
