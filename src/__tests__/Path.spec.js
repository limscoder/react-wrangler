import React from 'react';
import { fromJS } from 'immutable';
import { mount } from 'enzyme';
import Path from '../Path';
import Store from '../Store';

function Test() {
  return <span>foo</span>;
}

describe('Path', () => {
  let mountOptions;

  beforeEach(() => {
    const store = new Store(fromJS({ foo: 'bar', bar: 'baz' }));
    mountOptions = {
      context: { wrangleStore: store },
    };
  });

  it('renders component', () => {
    const path = mount(<Path component={Test} />, mountOptions);

    expect(path.html()).toBe('<span>foo</span>');
  });

  it('maps paths', () => {
    const mapPathsToProps = { foo: 'foo' };
    const path = mount(<Path component={Test} mapPathsToProps={mapPathsToProps} />, mountOptions);

    expect(path.find({ foo: 'bar' })).toBeTruthy();
  });

  it('maps callbacks', () => {
    const onChange = jest.fn();
    const mapCallbacksToProps = { onChange };
    const path = mount(<Path component={Test} mapCallbacksToProps={mapCallbacksToProps} />, mountOptions);

    expect(path.find({ onChange })).toBeTruthy();
  });

  it('updates mapped paths when mapPathsToProps changes', () => {
    const mapPathsToProps = { foo: 'foo' };
    const path = mount(<Path component={Test} mapPathsToProps={mapPathsToProps} />, mountOptions);

    const newMapPathsToProps = { foo: 'bar', baz: 'foo' };
    path.setProps({ mapPathsToProps: newMapPathsToProps });

    expect(path.find({ foo: 'baz' })).toBeTruthy();
    expect(path.find({ baz: 'bar' })).toBeTruthy();
  });

  it('updates mapped paths when store changes', () => {
    const mapPathsToProps = { foo: 'foo' };
    const path = mount(<Path component={Test} mapPathsToProps={mapPathsToProps} />, mountOptions);

    path.context().wrangleStore.setPath('foo', 'baz');

    expect(path.find({ foo: 'baz' })).toBeTruthy();
  });
});
