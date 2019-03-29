import * as React from 'react';
import {ShortcutContext} from '../ShortcutProvider';
import Key, {HeldKey} from '../keys';

export interface Subscription {
  unsubscribe(): void;
}

export interface Options {
  held?: HeldKey;
  node?: HTMLElement | null;
  ignoreInput?: boolean;
  allowDefault?: boolean;
}

export default function useShortcut(
  ordered: Key[],
  onMatch: (matched: {ordered: Key[]; held?: HeldKey}) => void,
  options: Options = {},
) {
  const shortcutManager = React.useContext(ShortcutContext);
  const subscription = React.useRef<Subscription | null>(null);

  React.useEffect(
    () => {
      const {node} = options;
      if (node != null) {
        return;
      }

      if (shortcutManager == null) {
        return;
      }

      subscription.current = shortcutManager.subscribe({
        onMatch,
        ordered,
        node,
        held: options.held,
        ignoreInput: options.ignoreInput || false,
        allowDefault: options.allowDefault || false,
      });

      // eslint-disable-next-line consistent-return
      return () => {
        if (subscription.current == null) {
          return;
        }

        subscription.current.unsubscribe();
      };
    },
    [ordered, onMatch, options],
  );
}
