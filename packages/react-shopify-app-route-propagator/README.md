# `@shopify/react-shopify-app-route-propagator`

[![Build Status](https://travis-ci.org/Shopify/quilt.svg?branch=master)](https://travis-ci.org/Shopify/quilt)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md) [![npm version](https://badge.fury.io/js/%40shopify%2Freact-shopify-app-route-propagator.svg)](https://badge.fury.io/js/%40shopify%2Freact-shopify-app-route-propagator) ![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@shopify/react-shopify-app-route-propagator.svg)

This package contains both a hook, `useRoutePropagation`, and a component `<RoutePropagator />`, API. Both of these allow you to synchronize a Shopify embedded app's client side routing with the outer iframe host. It assumes the embedded app is either using [Shopify's App Bridge Library](https://help.shopify.com/en/api/embedded-apps/app-bridge) or [Polaris v3+ with Shopify App Bridge](https://polaris.shopify.com/components/structure/app-provider#section-initializing-the-shopify-app-bridge)

The package is quite small and can be used with any routing solution.

## Installation

```bash
$ yarn add @shopify/app-bridge @shopify/react-shopify-app-route-propagator
```

## Usage

Both the hook and component versions of this library take the same two parameters:

```typescript
import {ClientApplication} from '@shopify/app-bridge';

export type LocationOrHref =
  | string
  | {search: string; hash: string; pathname: string};

export interface Props {
  app: ClientApplication<any>;
  location: LocationOrHref;
}
```

### `useRoutePropagation`

This example uses [app bridge](https://help.shopify.com/en/api/embedded-apps/app-bridge#set-up-your-app) to create an app instance and the `withRouter` enhancer from `react-router-router`.

```javascript
import React from 'react';
import {Switch, Route, withRouter} from 'react-router'
import {BrowserRouter} from 'react-router-dom'
import createApp, {getShopOrigin} from '@shopify/app-bridge';
import {useRoutePropagation} from '@shopify/react-shopify-app-route-propagator';

export default withRouter(function(props) {
  useRoutePropagation(
    createApp({
      apiKey: 'API key from Shopify Partner Dashboard',
      shopOrigin: getShopOrigin(),
    }),
    props.location
  );

  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/">
        { /* other routes */ }
      </Switch>
    </React.Fragment>
  );
})
```

### `<RoutePropagator />`

This example assume that you have [polaris-react](https://github.com/Shopify/polaris-react) v3 or higher.
Plus the `withRouter` enhancer from `react-router-router`.

```typescript
import React from 'react';
import {AppProvider} from '@shopify/polaris';
import * as PropTypes from 'prop-types';

export default function MyApp() {
  return (
    <BrowserRouter>
      <AppProvider
        apiKey='API key from Shopify Partner Dashboard',
        shopOrigin: getShopOrigin(),
      >
        <Routes />
      </AppProvider>
    </BrowserRouter>
  );
})
```

```typescript
import React from 'react';
import {RoutePropagator} from '@shopify/react-shopify-app-route-propagator';
import * as PropTypes from 'prop-types';

class Routes extends React.Component {
  // This line is very important! It tells React to attach the `polaris`
  // object to `this.context` within your component.
  static contextTypes = {
    polaris: PropTypes.object,
  };

  render() {
    ...
    const app = this.context.polaris.appBridge;
    const routePropagatorMarkup = app ? (
      <RoutePropagator location={location} app={app} />
    ) : null;


    return (
      <React.Fragment>
        {routePropagatorMarkup}
        <Switch>
          <Route exact path="/">
          { /* other routes */ }
        </Switch>
      </React.Fragment>
    );
  }
}
```

### Additional ways of getting a location object

#### With React Router (`<Route>`)

If you prefer things more explicit you can just get the `location` value to pass in explicitly by using `<Route>`'s children as a render prop.

```javascript
import * as React from 'react';
import { Switch, Route, withRouter } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import {RoutePropagator} from '@shopify/react-shopify-app-route-propagator';

export default function() {
  return (
    <Route>
      {({location}) => {
        <React.Fragment>
          <RoutePropagator location={location} app={app} />
          <Switch>
            <Route exact path="/">
            { /* other routes */ }
          </Switch>
        </React.Fragment>
      }}
    </Route>
  );
}
```

#### With a string

You can simply set location string value (but take care of the re-rendering yourself)

```javascript
const location = '/foo/bar?thing=true';
```

#### With `window.location`

Also need to take care of the re-rendering yourself

```javascript
const location = window.location;
```
