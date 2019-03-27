import * as React from 'react';
import {Preconnect} from '@shopify/react-html';
import {DeferTiming} from '@shopify/async';
import useImportRemote from './hooks';

export interface Props<Imported = any> {
  source: string;
  nonce?: string;
  preconnect?: boolean;
  onError(error: Error): void;
  getImport?(window: Window): Imported;
  onImported(imported: Imported): void;
  defer?: DeferTiming;
}

export default function ImportRemote(props: Props) {
  const {source, preconnect, onError, onImported, nonce, getImport} = props;
  const {global, error} = useImportRemote(source, {nonce, getImport});

  React.useEffect(
    () => {
      if (global) {
        onImported(global);
      }
    },
    [global],
  );

  React.useEffect(
    () => {
      if (error) {
        onError(error);
      }
    },
    [error],
  );

  if (preconnect) {
    const url = new URL(source);
    return <Preconnect source={url.origin} />;
  }

  return null;
}
