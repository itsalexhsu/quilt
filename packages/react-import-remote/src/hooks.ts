import * as React from 'react';
import {WindowWithRequestIdleCallback, DeferTiming} from '@shopify/async';
import load from './load';

interface Options<Imported = any> {
  nonce?: string;
  getImport?(window: Window): Imported;
  defer?: DeferTiming;
}

export default function useImportRemote<Imported = any>(
  source: string,
  options: Options = {},
): {loading: boolean; error: Error | null; global: Imported | null} {
  const idleCallbackHandle = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [global, setGlobal] = React.useState(null);
  const [error, setError] = React.useState(null);
  const {getImport, defer, nonce = ''} = options;

  React.useEffect(
    () => {
      const loadRemote = async () => {
        setLoading(true);
        try {
          const global = await load(source, getImport, nonce);
          setGlobal(global);
          setLoading(false);
        } catch (err) {
          setError(err);
          setLoading(false);
        }
      };

      if (defer === DeferTiming.Idle && 'requestIdleCallback' in window) {
        idleCallbackHandle.current = (window as WindowWithRequestIdleCallback).requestIdleCallback(
          loadRemote,
        );
      } else {
        loadRemote();
      }

      return () => {
        if (
          idleCallbackHandle.current != null &&
          'cancelIdleCallback' in window
        ) {
          (window as WindowWithRequestIdleCallback).cancelIdleCallback(
            idleCallbackHandle.current,
          );
        }
      };
    },
    [source],
  );

  return {loading, global, error};
}
