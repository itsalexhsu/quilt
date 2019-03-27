import * as React from 'react';

function useDebounce(fn: () => any, ms: number = 0, args: Array<any> = []) {
  React.useEffect(() => {
    const handle = setTimeout(fn.bind(null, args), ms);

    return () => {
      clearTimeout(handle);
    };
  }, args);
}

export default useDebounce;
