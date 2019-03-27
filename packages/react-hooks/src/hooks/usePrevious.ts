import * as React from 'react';

export default function usePrevious(value: any) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
