import * as React from 'react';
import {
  Props as PropsForComponent,
  Arguments,
  MaybeFunctionReturnType as ReturnType,
} from '@shopify/useful-types';
import {Tag, FunctionKeys} from './types';

export type Predicate = (element: Element<unknown>) => boolean;

type Root = import('./root').Root<any>;

interface Tree<Props> {
  tag: Tag;
  type: string | React.ComponentType<any> | null;
  props: Props;
  instance?: any;
}

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

  find<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): Element<PropsForComponent<Type>> | null {
    return (this.elementDescendants.find(element => element.type === type) ||
      null) as Element<PropsForComponent<Type>> | null;
  }

  findAll<Type extends React.ComponentType<any> | string>(
    type: Type,
  ): Element<PropsForComponent<Type>>[] {
    return this.elementDescendants.filter(
      element => element.type === type,
    ) as Element<PropsForComponent<Type>>[];
  }

  findWhere(predicate: Predicate) {
    return this.elementDescendants.find(predicate) || null;
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
}
