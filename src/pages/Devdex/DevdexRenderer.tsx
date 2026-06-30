/**
 * @file `DevdexRenderer.tsx`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { SandwichProvider } from '@showdex/components/layout';
import { type RootStore } from '@showdex/redux/store';
import { type DevdexProps, Devdex } from './Devdex';

export interface DevdexRendererProps extends DevdexProps {
  store: RootStore;
}

export const DevdexRenderer = ({
  store,
  ...props
}: DevdexRendererProps): React.JSX.Element => (
  <ReduxProvider store={store}>
    <SandwichProvider>
      <Devdex {...props} />
    </SandwichProvider>
  </ReduxProvider>
);

/**
 * Renders the React-based Devdex interface.
 *
 * @since 1.2.5
 */
export const DevdexDomRenderer = (
  dom: ReactDOM.Root,
  props: DevdexRendererProps,
): void => void dom.render(<DevdexRenderer {...props} />);
