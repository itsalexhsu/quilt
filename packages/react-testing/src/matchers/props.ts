import {
  matcherHint,
  printReceived,
  printExpected,
  RECEIVED_COLOR as receivedColor,
} from 'jest-matcher-utils';
import {MatcherState, Node} from './types';

export function toHaveReactProp<Props>(
  this: MatcherState,
  node: Node<Props>,
  prop: keyof Props,
  value?: unknown,
) {
  const valuePassed = arguments.length > 2;
  const hasProp = Reflect.has(node.props as any, prop);
  const pass = valuePassed ? this.equals(value, node.prop(prop)) : hasProp;

  const message = pass
    ? () =>
        `${matcherHint('.not.toHaveReactProp', 'React element', 'prop', {
          secondArgument: 'value',
        })}\n\n` +
        `Expected the React element:\n  ${printReceived(node)}\n` +
        `Not to have prop:\n  ${printExpected(prop)}\n${
          valuePassed ? `With a value of\n  ${printExpected(value)}\n` : ''
        }`
    : () =>
        `${`${matcherHint('.toHaveReactProp', 'React element', 'prop', {
          secondArgument: 'value',
        })}\n\n` +
          `Expected the React element:\n  ${receivedColor(printNode(node))}\n` +
          `To have prop:\n  ${printExpected(prop)}\n${
            valuePassed ? `With a value of:\n  ${printExpected(value)}\n` : ''
          }`}${
          hasProp ? `Received:\n  ${printReceived(node.prop(prop))}` : ''
        }`;

  return {pass, message};
}

function printNode(node: Node<unknown>) {
  const {type} = node;

  if (type == null) {
    throw new Error('Tried to print an invalid node');
  }

  const name = typeof type === 'string' ? type : type.displayName || type.name;
  return `<${name} />`;
}
