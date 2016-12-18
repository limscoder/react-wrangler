import React from 'react';
import { fromJS } from 'immutable';
import { mount } from 'enzyme';
import Wrangle from '../Wrangle';

function getStore(wrapper) {
  return wrapper.instance().getChildContext().wrangleStore;
}

describe('Wrangle', () => {
  it('configures childContext and initializes state', () => {
    const state = fromJS({ foo: 'bar' });
    const wrangle = mount(<Wrangle initialState={state} />);
    const store = getStore(wrangle);

    expect(store.getPath('foo')).toBe('bar');
  });

  it('calls onMissingPaths on next animation frame', () => {
    jest.useFakeTimers();
    const onMissingPaths = jest.fn();
    const wrangle = mount(<Wrangle onMissingPaths={onMissingPaths} />);
    const store = getStore(wrangle);
    store.getPath('foo');
    store.getPath('bar');

    expect(onMissingPaths).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(onMissingPaths).toHaveBeenCalledWith(store, ['foo', 'bar']);
  });

  it('calls onStoreChange when store changes', () => {
    const onStoreChange = jest.fn();
    const wrangle = mount(<Wrangle onStoreChange={onStoreChange} />);
    const store = getStore(wrangle);
    store.setPath('foo', 'bar');

    expect(onStoreChange).toHaveBeenCalledWith(store, { foo: 'bar' });
  });
});
