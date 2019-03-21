import * as jestMatcherUtilities from 'jest-matcher-utils';

import {Root} from '../root';
import {Element} from '../element';

export type Node<Props> = Root<Props> | Element<Props>;

// See https://github.com/facebook/jest/blob/master/packages/expect/src/types.ts#L29-L53

export type Tester = (a: any, b: any) => boolean | undefined;

export interface MatcherState {
  assertionCalls: number;
  currentTestName?: string;
  dontThrow?: () => void;
  error?: Error;
  equals: (
    a: unknown,
    b: unknown,
    customTesters?: Array<Tester>,
    strictCheck?: boolean,
  ) => boolean;
  expand?: boolean;
  expectedAssertionsNumber?: number;
  isExpectingAssertions?: boolean;
  isNot: boolean;
  promise: string;
  suppressedErrors: Array<Error>;
  testPath?: string;
  utils: typeof jestMatcherUtilities & {
    iterableEquality: Tester;
    subsetEquality: Tester;
  };
}
