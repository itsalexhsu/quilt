import * as React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {act} from 'react-dom/test-utils';
import {Props as PropsForComponent} from '@shopify/useful-types';

import {TestWrapper} from './TestWrapper';
import {Element, Predicate, Comparable} from './element';
import {Tag, Fiber, ReactInstance} from './types';

// eslint-disable-next-line typescript/no-var-requires
const {findCurrentFiberUsingSlowPath} = require('react-reconciler/reflection');

export const connected = new Set<Root<unknown>>();

export class Root<Props> {
  get children() {
    return this.withRoot(root => root.children);
  }

  get descendants() {
    return this.withRoot(root => root.descendants);
  }

  get props() {
    return this.withRoot(root => root.props);
  }

  get isDOM() {
    return this.withRoot(root => root.isDOM);
  }

  get instance() {
    return this.withRoot(root => root.instance);
  }

  private wrapper: TestWrapper<Props> | null = null;
  private element = document.createElement('div');
  private root: Element<Props> | null = null;

  private get mounted() {
    return this.wrapper != null;
  }

  constructor(private tree: React.ReactElement<Props>) {
    this.mount();
  }

  perform<T>(action: () => T, {update = true} = {}): T {
    let result!: T;

    act(() => {
      result = action();
    });

    if (update) {
      this.update();
    }

    return result;
  }

  mount() {
    if (this.mounted) {
      throw new Error('Attempted to mount a node that was already mounted');
    }

    if (this.element.parentNode == null) {
      document.body.appendChild(this.element);
      connected.add(this);
    }

    this.perform(() => {
      render(
        <TestWrapper<Props>
          ref={wrapper => {
            this.wrapper = wrapper;
          }}
        >
          {this.tree}
        </TestWrapper>,
        this.element,
      );
    });
  }

  is<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): this is Root<PropsForComponent<Type>>;

  is<Props>(type: React.ReactElement<Props>): this is Root<Props>;

  is(type: Comparable): boolean {
    return this.withRoot(root => root.is(type as any));
  }

  test(predicate: Predicate) {
    return this.withRoot(root => root.test(predicate));
  }

  html() {
    this.ensureRoot();

    // Usually we defer to the root, but this is a quicker path
    // if they only care about the root node
    return this.element.innerHTML;
  }

  text() {
    this.ensureRoot();

    // Usually we defer to the root, but this is a quicker path
    // if they only care about the root node
    return this.element.textContent || '';
  }

  prop<K extends keyof Props>(key: K) {
    return this.withRoot(root => root.prop(key));
  }

  find<Type extends React.ComponentType<any> | string>(type: Type) {
    return this.withRoot(root => root.find(type));
  }

  findAll<Type extends React.ComponentType<any> | string>(type: Type) {
    return this.withRoot(root => root.findAll(type));
  }

  findWhere(predicate: Predicate) {
    return this.withRoot(root => root.findWhere(predicate));
  }

  findAllWhere(predicate: Predicate) {
    return this.withRoot(root => root.findAllWhere(predicate));
  }

  getDOMNode<Type extends HTMLElement = HTMLElement>() {
    return this.withRoot(root => root.getDOMNode<Type>());
  }

  getDOMNodes<Type extends HTMLElement = HTMLElement>() {
    return this.withRoot(root => root.getDOMNodes<Type>());
  }

  contains(search: Comparable) {
    return this.withRoot(root => root.contains(search));
  }

  unmount() {
    if (!this.mounted) {
      throw new Error(
        'You attempted to unmount a node that was already unmounted',
      );
    }

    this.ensureRoot();
    this.perform(() => unmountComponentAtNode(this.element));
  }

  destroy() {
    const {element, mounted} = this;

    if (mounted) {
      this.unmount();
    }

    element.remove();
    connected.delete(this);
  }

  setProps(props: Partial<Props>) {
    this.ensureRoot();
    this.perform(() => this.wrapper!.setProps(props));
  }

  update() {
    if (this.wrapper == null) {
      this.root = null;
    } else {
      this.root = flatten(
        ((this.wrapper as unknown) as ReactInstance)._reactInternalFiber,
        this,
      )[1] as Element<Props> | null;
    }
  }

  forceUpdate() {
    this.ensureRoot();
    this.perform(() => this.wrapper!.forceUpdate());
  }

  debug() {
    return this.element.innerHTML;
  }

  private ensureRoot() {
    if (this.wrapper == null || this.root == null) {
      throw new Error(
        'Attempted to operate on a mounted tree, but the component is no longer mounted',
      );
    }
  }

  private withRoot<T>(withRoot: (root: Element<Props>) => T): T {
    this.ensureRoot();
    return withRoot(this.root!);
  }
}

function flatten(
  element: Fiber,
  root: Root<unknown>,
): (Element<unknown> | string)[] {
  const node: Fiber = findCurrentFiberUsingSlowPath(element);

  if (node.tag === Tag.HostText) {
    return [node.memoizedProps as string];
  }

  const props = {...(node.memoizedProps || {})};
  const {children, descendants} = childrenToTree(node.child, root);

  return [
    new Element(
      {
        tag: node.tag,
        type: node.type,
        props,
        instance: node.stateNode,
      },
      children,
      descendants,
      root,
    ),
    ...descendants,
  ];
}

function childrenToTree(fiber: Fiber | null, root: Root<unknown>) {
  let currentFiber = fiber;
  const children: (string | Element<unknown>)[] = [];
  const descendants: (string | Element<unknown>)[] = [];

  while (currentFiber != null) {
    const result = flatten(currentFiber, root);

    if (result.length > 0) {
      children.push(result[0]);
      descendants.push(...result);
    }

    currentFiber = currentFiber.sibling;
  }

  return {children, descendants};
}
