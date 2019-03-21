import * as React from 'react';
import {
  Props as PropsForComponent,
  Arguments,
  MaybeFunctionReturnType as ReturnType,
} from '@shopify/useful-types';
import {Tag} from './types';

type FunctionKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends ((...args: any[]) => any)
    ? K
    : never
}[keyof T];

export type Predicate = (element: Element<unknown>) => boolean;
export type Comparable =
  | string
  | React.ComponentType<any>
  | React.ReactElement<any>;

type Root = import('./root').Root<any>;

interface Tree<Props> {
  tag: Tag;
  type: string | React.ComponentType<any> | null;
  props: Props;
  instance?: any;
}

const ANY_PROP_MATCHER = {};

export class Element<Props> {
  get props(): Props {
    return this.tree.props;
  }

  get type() {
    return this.tree.type;
  }

  get isDOM() {
    return this.tree.tag === Tag.HostComponent;
  }

  get instance() {
    return this.tree.instance;
  }

  get children() {
    return this.elementChildren;
  }

  get descendants() {
    return this.elementDescendants;
  }

  private readonly elementChildren: Element<unknown>[];
  private readonly elementDescendants: Element<unknown>[];

  constructor(
    private readonly tree: Tree<Props>,
    private readonly allChildren: (Element<unknown> | string)[],
    allDescendants: (Element<unknown> | string)[],
    public readonly root: Root,
  ) {
    this.elementChildren = allChildren.filter(
      element => typeof element !== 'string',
    ) as Element<unknown>[];

    this.elementDescendants = allDescendants.filter(
      element => typeof element !== 'string',
    ) as Element<unknown>[];
  }

  prop<K extends keyof Props>(key: K): Props[K] {
    return this.props[key];
  }

  text(): string {
    const {instance, allChildren} = this;

    if (instance instanceof HTMLElement) {
      return instance.textContent || '';
    }

    return allChildren.reduce<string>(
      (text, child) =>
        text + (typeof child === 'string' ? child : child.text()),
      '',
    );
  }

  html(): string {
    const {instance, allChildren} = this;

    if (instance instanceof HTMLElement) {
      return instance.innerHTML;
    }

    return allChildren.reduce<string>(
      (text, child) =>
        text + (typeof child === 'string' ? child : child.html()),
      '',
    );
  }

  is<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): this is Element<PropsForComponent<Type>>;

  is<Props>(type: React.ReactElement<Props>): this is Element<Props>;

  is(type: Comparable): boolean {
    return this.equalsElement(elementFromComparable(type, this.root));
  }

  test(predicate: Predicate): boolean {
    return predicate(this);
  }

  find<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): Element<PropsForComponent<Type>> | null {
    return (this.elementDescendants.find(element => element.is(type)) ||
      null) as Element<PropsForComponent<Type>> | null;
  }

  findAll<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): Element<PropsForComponent<Type>>[] {
    return this.elementDescendants.filter(element =>
      element.is(type),
    ) as Element<PropsForComponent<Type>>[];
  }

  findWhere(predicate: Predicate) {
    return this.elementDescendants.find(predicate);
  }

  findAllWhere(predicate: Predicate) {
    return this.elementDescendants.filter(predicate);
  }

  getDOMNodes<Type extends HTMLElement = HTMLElement>(): Type[] {
    return this.elementChildren
      .filter(element => element.isDOM)
      .map(element => element.instance);
  }

  getDOMNode<Type extends HTMLElement = HTMLElement>(): Type | null {
    const domNodes = this.getDOMNodes<Type>();

    if (domNodes.length > 1) {
      throw new Error(
        'You can’t call getDOMNode() on an element that returns multiple HTML elements. Call getDOMNodes() to retrieve all of the elements instead.',
      );
    }

    return domNodes[0] || null;
  }

  trigger<K extends FunctionKeys<Props>>(
    prop: K,
    ...args: Arguments<Props[K]>
  ): ReturnType<NonNullable<Props[K]>> {
    return this.root.perform(() => (this.props[prop] as any)(...args));
  }

  contains(search: Comparable) {
    const searchElement = elementFromComparable(search, this.root);
    return (
      this.findWhere(element => element.equalsElement(searchElement)) != null
    );
  }

  private equalsElement(element: Element<any>) {
    return this.type === element.type && propsAreEqual(this, element);
  }
}

function elementFromComparable(
  search: Comparable,
  root: Root,
): Element<unknown> {
  if (typeof search === 'string') {
    return new Element(
      {
        tag: Tag.HostComponent,
        type: search,
        props: ANY_PROP_MATCHER,
      },
      [],
      [],
      root,
    );
  } else if (typeof search === 'function') {
    // It could also be a class component, but we don't really need to check here
    // because it doesn’t end up being part of our equality check for elements
    return new Element(
      {
        tag: Tag.FunctionComponent,
        type: search,
        props: ANY_PROP_MATCHER,
      },
      [],
      [],
      root,
    );
  } else {
    const {props, type} = search;

    const normalizedProps = {...(props || {})};
    delete normalizedProps.children;

    const tag =
      typeof type === 'string' ? Tag.HostComponent : Tag.FunctionComponent;

    return new Element(
      {
        tag,
        type,
        props: normalizedProps,
      },
      [],
      [],
      root,
    );
  }
}

function propsAreEqual(
  {props: propsOne}: Element<any>,
  {props: propsTwo}: Element<any>,
) {
  if (propsOne === ANY_PROP_MATCHER || propsTwo === ANY_PROP_MATCHER) {
    return true;
  }

  const propsOneKeys = Object.keys(propsOne).sort();
  const propsTwoKeys = Object.keys(propsTwo).sort();

  return propsOneKeys.every(
    (key, index) =>
      key === propsTwoKeys[index] && propsOne[key] === propsTwo[key],
  );
}
