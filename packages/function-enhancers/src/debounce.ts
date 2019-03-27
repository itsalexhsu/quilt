export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export default function debounce<F extends Function>(
  method: F,
  // the number to delay in milliseconds
  wait: number = 0,
  options?: DebounceOptions,
): F {
  const leading =
    options && options.leading !== undefined ? options.leading : false;
  const trailing =
    options && options.trailing !== undefined ? options.trailing : true;

  let result;
  let lastArgs;
  let lastThis;
  let timer;

  function executeMethod() {
    result = method.apply(lastThis, lastArgs);
    lastThis = undefined;
    lastArgs = undefined;
    return result;
  }

  function expireTimer() {
    timer = undefined;
  }

  function expireAndExecute() {
    expireTimer();
    executeMethod();
  }

  return (function debounced(...args) {
    // eslint-disable-next-line consistent-this
    lastThis = this;
    lastArgs = args;

    if (!timer) {
      if (leading) {
        executeMethod();
      }

      if (trailing) {
        timer = setTimeout(expireAndExecute, wait);
      }
    }

    if (leading) {
      timer = setTimeout(expireTimer, wait);
    } else if (trailing && leading) {
      return executeMethod();
    }

    return result;
  } as unknown) as F;
}
