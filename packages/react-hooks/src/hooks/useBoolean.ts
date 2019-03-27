import * as React from 'react';

export function useBoolean(initialValue) {
  const [value, setValue] = React.useState(initialValue);

  return {
    value,
    setValue,
    toggle: React.useCallback(() => setValue(val => !val), []),
    setTrue: React.useCallback(() => setValue(true), []),
    setFalse: React.useCallback(() => setValue(false), []),
  };
}
