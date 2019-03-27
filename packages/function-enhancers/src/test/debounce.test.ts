/**
 * @jest-environment jsdom
 */

import debounce from '../debounce';

describe('debounce()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('default: leading=false, trailing=true', () => {
    it('execute the debounced function immediately when wait time is not set', () => {
      const spy = jest.fn((value: string) => value);
      const debounced = debounce(spy);

      expect(debounced('a')).toBeUndefined();

      jest.advanceTimersByTime(0);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });

    it('should only execute the last of the debounced function calls after wait time elapsed', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait);

      expect(debounced('a')).toBeUndefined();
      expect(debounced('b')).toBeUndefined();
      expect(debounced('c')).toBeUndefined();

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('c');
    });

    it('should return the result of the last executed debounced function calls', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait);

      expect(debounced('a')).toBeUndefined();
      expect(debounced('b')).toBeUndefined();
      expect(debounced('c')).toBeUndefined();

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('c');

      expect(debounced('d')).toEqual('c');
      expect(debounced('e')).toEqual('c');
      expect(debounced('f')).toEqual('c');

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('f');
    });
  });

  describe('trailing=true, leading=false implied', () => {
    it('should only execute the last of the debounced function calls after wait time elapsed', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {trailing: true});

      expect(debounced('a')).toBeUndefined();
      expect(debounced('b')).toBeUndefined();
      expect(debounced('c')).toBeUndefined();

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('c');
    });

    it('should return the result of the last executed debounced function calls', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {trailing: true});

      expect(debounced('a')).toBeUndefined();
      expect(debounced('b')).toBeUndefined();
      expect(debounced('c')).toBeUndefined();

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('c');

      expect(debounced('d')).toEqual('c');
      expect(debounced('e')).toEqual('c');
      expect(debounced('f')).toEqual('c');

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('f');
    });
  });

  describe('leading=true, trailing=true implied', () => {
    it('execute the debounced function immediately', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true});

      expect(debounced('a')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });

    it('should execute the first of the debounced function calls', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true});

      expect(debounced('a')).toEqual('a');
      expect(debounced('b')).toEqual('a');
      expect(debounced('c')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });

    it('should execute the first of the debounced function calls and last of the calls after wait time elapsed', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true});

      expect(debounced('a')).toEqual('a');
      expect(debounced('b')).toEqual('a');
      expect(debounced('c')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');

      jest.advanceTimersByTime(wait);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('c');
    });
  });

  describe('leading=true & trailing=false', () => {
    it('execute the debounced function immediately', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true, trailing: false});

      expect(debounced('a')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });

    it('should only execute the first of the debounced function calls', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true, trailing: false});

      expect(debounced('a')).toEqual('a');
      expect(debounced('b')).toEqual('a');
      expect(debounced('c')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });

    it('should only execute the first of the debounced function calls after wait time elapsed', () => {
      const spy = jest.fn((value: string) => value);
      const wait = 100;
      const debounced = debounce(spy, wait, {leading: true, trailing: false});

      expect(debounced('a')).toEqual('a');
      expect(debounced('b')).toEqual('a');
      expect(debounced('c')).toEqual('a');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');

      jest.advanceTimersByTime(wait);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('a');
    });
  });
});
