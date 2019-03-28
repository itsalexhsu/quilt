import * as React from 'react';
import {mount} from '@shopify/react-testing';
import {ClientApplication} from '@shopify/app-bridge';
import {History as AppBridgeHistory} from '@shopify/app-bridge/actions';
import {MODAL_IFRAME_NAME} from '../globals';
import useRoutePropagation from '../hook';

function MockRoutePropagator({app, location}) {
  useRoutePropagation(app, location);
  return null;
}

jest.mock('../globals', () => {
  return {
    ...require.requireActual('../globals'),
    getOrigin: jest.fn(),
    getTopWindow: jest.fn(),
    getSelfWindow: jest.fn(),
  };
});

const mockUtilities = require.requireMock('../globals');
const {getOrigin, getTopWindow, getSelfWindow} = mockUtilities;

describe('@shopify/react-shopify-app-route-propagator', () => {
  const topWindow = {
    name: '',
  };
  const selfWindow = {
    name: '',
  };

  const mockApp = {} as ClientApplication<any>;

  const appBridgeHistoryMock = {
    dispatch: jest.fn(),
  };
  AppBridgeHistory.create = jest.fn().mockReturnValue(appBridgeHistoryMock);

  beforeEach(() => {
    jest.clearAllMocks();

    getOrigin.mockImplementation(() => 'https://test.com');
    getTopWindow.mockImplementation(() => topWindow);
    getSelfWindow.mockImplementation(() => selfWindow);
  });

  it('dispatch a replace action on mount', () => {
    const path = '/settings';

    mount(<MockRoutePropagator location={path} app={mockApp} />);

    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledTimes(1);
    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledWith(
      AppBridgeHistory.Action.REPLACE,
      path,
    );
  });

  it('dispatch a replace action when the location updates', () => {
    const firstPath = '/settings';
    const propagator = mount(
      <MockRoutePropagator location={firstPath} app={mockApp} />,
    );

    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledTimes(1);
    expect(appBridgeHistoryMock.dispatch).toHaveBeenLastCalledWith(
      AppBridgeHistory.Action.REPLACE,
      firstPath,
    );

    const secondPath = '/foo';
    propagator.setProps({location: secondPath});

    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledTimes(2);
    expect(appBridgeHistoryMock.dispatch).toHaveBeenLastCalledWith(
      AppBridgeHistory.Action.REPLACE,
      secondPath,
    );
  });

  it('does not dispatch a replace action when the location updates but the value stay the same', () => {
    const firstPath = '/settings';
    const propagator = mount(
      <MockRoutePropagator location={firstPath} app={mockApp} />,
    );

    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledTimes(1);
    expect(appBridgeHistoryMock.dispatch).toHaveBeenLastCalledWith(
      AppBridgeHistory.Action.REPLACE,
      firstPath,
    );

    propagator.setProps({location: firstPath});

    expect(appBridgeHistoryMock.dispatch).toHaveBeenCalledTimes(1);
  });

  describe('when window is window.top', () => {
    it('does not dispatch a replace action on mount', () => {
      getSelfWindow.mockImplementation(() => topWindow);

      mount(<MockRoutePropagator location="/settings" app={mockApp} />);

      expect(appBridgeHistoryMock.dispatch).not.toBeCalled();
    });

    it('does not dispatch a replace action when the location updates', () => {
      getSelfWindow.mockImplementation(() => topWindow);

      const propagator = mount(
        <MockRoutePropagator location="/settings" app={mockApp} />,
      );

      const path = '/foo';
      propagator.setProps({location: path});

      expect(appBridgeHistoryMock.dispatch).not.toBeCalled();
    });
  });

  describe('when window is an iframe', () => {
    it('does not dispatch a replace action on mount', () => {
      getSelfWindow.mockImplementation(() => ({
        name: MODAL_IFRAME_NAME,
      }));
      mount(<MockRoutePropagator location="/settings" app={mockApp} />);

      expect(appBridgeHistoryMock.dispatch).not.toBeCalled();
    });

    it('does not dispatch a replace action when the location updates', () => {
      getSelfWindow.mockImplementation(() => ({
        name: MODAL_IFRAME_NAME,
      }));

      const propagator = mount(
        <MockRoutePropagator location="/settings" app={mockApp} />,
      );

      propagator.setProps({location: '/foo'});

      expect(appBridgeHistoryMock.dispatch).not.toBeCalled();
    });
  });
});
