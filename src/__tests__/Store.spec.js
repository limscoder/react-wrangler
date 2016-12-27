import { fromJS } from 'immutable';
import Store from '../Store';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = new Store({
      initialState: fromJS({
        user: { name: 'black bart' },
      }),
      onMissingPath: jest.fn(),
    });
  });

  describe('#getPath', () => {
    it('returns initialized paths', () => {
      expect(store.getPath('user.name')).toBe('black bart');
    });

    it('returns uninitialized paths with undefined', () => {
      expect(store.getPath('user.phoneNumber')).toBe(undefined);
    });

    it('returns uninitialized paths with default value', () => {
      expect(store.getPath('user.phoneNumber', '555-555-5555')).toBe('555-555-5555');
    });

    it('calls onMissingPath for uninitialized paths', () => {
      store.getPath('user.phoneNumber');

      expect(store.onMissingPath).toHaveBeenCalled();
    });
  });

  describe('#setPath', () => {
    it('updates single path', () => {
      store.setPath('user.name', 'Malicious Marge');
      expect(store.getPath('user.name')).toBe('Malicious Marge');
    });

    it('updated undefined path', () => {
      store.setPath('user.preference.phoneNumber', '555-555-5555');
      expect(store.getPath('user.preference.phoneNumber')).toBe('555-555-5555');
    });

    it('updates multiple paths', () => {
      store.setPaths({
        'user.name': 'Malicious Marge',
        'user.preference.phoneNumber': '555-555-5555',
      });

      expect(store.getPath('user.name')).toBe('Malicious Marge');
      expect(store.getPath('user.preference.phoneNumber')).toBe('555-555-5555');
    });

    it('notifies listeners', () => {
      const mock = jest.fn();

      store.subscribe(mock);
      store.setPath({ 'user.name': 'Malicious Marge' });

      expect(mock).toHaveBeenCalled();
    });

    it('does not notify un-subscribed listeners', () => {
      const mock = jest.fn();

      store.subscribe(mock);
      store.unsubscribe(mock);
      store.setPath({ 'user.name': 'Malicious Marge' });

      expect(mock).not.toHaveBeenCalled();
    });
  });
});
