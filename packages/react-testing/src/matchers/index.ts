import {toHaveReactProp} from './props';
import {Node} from './types';

type Props<T> = T extends Node<infer U> ? U : never;

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveReactProp<Prop extends keyof Props<R>>(
        prop: Prop,
        value?: Props<R>[Prop],
      ): void;
    }
  }
}

expect.extend({toHaveReactProp});
