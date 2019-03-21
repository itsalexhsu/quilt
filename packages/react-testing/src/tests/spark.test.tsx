/* eslint shopify/jest/no-snapshots: off, jest/expect-expect: off */

import * as React from 'react';
import {clock} from '@shopify/jest-dom-mocks';
import {mount} from '..';

import '../matchers';

describe('tests', () => {
  afterEach(() => {
    if (clock.isMocked()) {
      clock.restore();
    }
  });

  it.only('supports basic prop checks', () => {
    function ComplexComponent(_props: {object: object}) {
      return null;
    }

    function MyComponent() {
      return (
        <>
          <div aria-label="Hi" />
          <ComplexComponent object={{foo: {bar: 'baz'}}} />
        </>
      );
    }

    const myComponent = mount(<MyComponent />);
    expect(myComponent.find('div')).toHaveReactProp('aria-label', 'Hi');
    expect(myComponent.find(ComplexComponent)).toHaveReactProp(
      'object',
      expect.objectContaining({foos: expect.anything()}),
    );
  });

  it('supports useState', () => {
    function MyComponent() {
      const [count, setCount] = React.useState(0);
      return (
        <>
          <span>{count}</span>
          <Clicker onClick={() => setCount(100)} />
        </>
      );
    }

    const myComponent = mount(<MyComponent />);
    expect(myComponent.debug()).toMatchInlineSnapshot(
      `"<span>0</span><div></div>"`,
    );

    myComponent.find(Clicker)!.trigger('onClick');
    expect(myComponent.debug()).toMatchInlineSnapshot(
      `"<span>100</span><div></div>"`,
    );
  });

  describe('getDomNode()', () => {
    it('finds a single nested DOM node', () => {
      function MyComponent() {
        return <div>Hello world</div>;
      }

      const myComponent = mount(<MyComponent />);
      expect(myComponent.getDOMNode()).toMatchInlineSnapshot(`
<div>
  Hello world
</div>
`);
    });

    it('throws when there is more than one DOM node', () => {
      function MyComponent() {
        return (
          <>
            <span>Hello</span> <span>world</span>
          </>
        );
      }

      const myComponent = mount(<MyComponent />);
      expect(() => myComponent.getDOMNode()).toThrowErrorMatchingInlineSnapshot(
        `"You can’t call getDOMNode() on an element that returns multiple HTML elements. Call getDOMNodes() to retrieve all of the elements instead."`,
      );
    });
  });

  describe('html', () => {
    it('returns the combined markup', () => {
      function MyComponent({includeSelf = false} = {}) {
        const selfMarkup = includeSelf ? (
          <>
            Oh, and <MyComponent />
          </>
        ) : null;

        return (
          <>
            <div>Hello</div> <span>world</span>
            {selfMarkup}
          </>
        );
      }

      const myComponent = mount(<MyComponent includeSelf />);
      expect(myComponent.html()).toMatchInlineSnapshot(
        `"<div>Hello</div> <span>world</span>Oh, and <div>Hello</div> <span>world</span>"`,
      );

      expect(myComponent.find(MyComponent)!.html()).toMatchInlineSnapshot(
        `"Hello world"`,
      );
    });
  });

  describe('context', () => {
    const MyContext = React.createContext<string>('world');

    it('works with the useContext hook', () => {
      function MyComponent() {
        const helloTo = React.useContext(MyContext);
        return <div>Hello {helloTo}</div>;
      }

      const myComponent = mount(<MyComponent />);
      expect(myComponent.debug()).toMatchInlineSnapshot(
        `"<div>Hello world</div>"`,
      );
    });

    it('works with context provider/ consumer nodes', () => {
      function MyComponent() {
        return (
          <MyContext.Consumer>
            {(helloTo) => <div>Hello {helloTo}</div>}
          </MyContext.Consumer>
        );
      }

      const myComponent = mount(
        <MyContext.Provider value="Mica">
          <MyComponent />
        </MyContext.Provider>,
      );

      expect(myComponent.debug()).toMatchInlineSnapshot(
        `"<div>Hello Mica</div>"`,
      );
    });
  });

  describe('contains', () => {
    function SearchFor(_props: {aProp?: string; children?: React.ReactNode}) {
      return null;
    }

    it('identifies matches when the argument is a component', () => {
      function MyComponent({include}: {include: boolean}) {
        return <div>{include && <SearchFor aProp="someValue" />}</div>;
      }

      expect(mount(<MyComponent include={false} />).contains(SearchFor)).toBe(
        false,
      );
      expect(mount(<MyComponent include />).contains(SearchFor)).toBe(true);
    });

    it('identifies matches when the argument is a DOM element', () => {
      function MyComponent({include}: {include: boolean}) {
        return <div>{include && <span onMouseEnter={() => {}} />}</div>;
      }

      expect(mount(<MyComponent include={false} />).contains('span')).toBe(
        false,
      );
      expect(mount(<MyComponent include />).contains('span')).toBe(true);
    });

    it('identifies matches when the argument is a React element', () => {
      function MyComponent({include}: {include: boolean}) {
        return <div>{include && <SearchFor />}</div>;
      }

      expect(
        mount(<MyComponent include={false} />).contains(<SearchFor />),
      ).toBe(false);
      expect(mount(<MyComponent include />).contains(<SearchFor />)).toBe(true);
    });

    it('does a shallow comparison on props', () => {
      function MyComponent() {
        return (
          <div>
            <SearchFor aProp="foo" />
          </div>
        );
      }

      expect(mount(<MyComponent />).contains(<SearchFor aProp="bar" />)).toBe(
        false,
      );

      expect(mount(<MyComponent />).contains(<SearchFor aProp="foo" />)).toBe(
        true,
      );
    });
  });

  describe('is', () => {
    it('checks the type when a DOM node or React component is passed', () => {
      function SearchFor() {
        return null;
      }

      function MyComponent() {
        return (
          <>
            <div />
            <SearchFor />
          </>
        );
      }

      const myComponent = mount(<MyComponent />);
      expect(myComponent.children[0].is('div')).toBe(true);
      expect(myComponent.children[1].is(SearchFor)).toBe(true);
    });

    it('checks an element against a JSX element', () => {
      function SearchFor(_props: {aProp?: string}) {
        return null;
      }

      function MyComponent() {
        return (
          <>
            <div />
            <SearchFor aProp="foo" />
          </>
        );
      }

      const myComponent = mount(<MyComponent />);
      const searchFor = myComponent.find(SearchFor)!;
      expect(searchFor.is(<SearchFor aProp="foo" />)).toBe(true);
      expect(searchFor.is(<SearchFor aProp="bar" />)).toBe(false);
    });
  });

  it('supports updates happening "out of band"', () => {
    function MyComponent() {
      const [count, setCount] = React.useState(0);
      React.useEffect(() => {
        const timeout = window.setTimeout(() => setCount(100), 200);
        return () => window.clearTimeout(timeout);
      });

      return <span>{count}</span>;
    }

    clock.mock();

    const myComponent = mount(<MyComponent />);
    expect(myComponent.find('span')).toMatchInlineSnapshot(`
Element {
  "allChildren": Array [],
  "elementChildren": Array [],
  "elementDescendants": Array [],
  "root": null,
  "tree": Object {
    "instance": <span>
      0
    </span>,
    "props": Object {
      "children": 0,
    },
    "tag": 5,
    "type": "span",
  },
}
`);

    myComponent.perform(() => clock.tick(1000));
    expect(myComponent.find('span')).toMatchInlineSnapshot(`
Element {
  "allChildren": Array [],
  "elementChildren": Array [],
  "elementDescendants": Array [],
  "root": null,
  "tree": Object {
    "instance": <span>
      100
    </span>,
    "props": Object {
      "children": 100,
    },
    "tag": 5,
    "type": "span",
  },
}
`);
  });
});

function Clicker({onClick}: {onClick(): void}) {
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return <div onClick={onClick} />;
}
