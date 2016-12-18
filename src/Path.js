import React, { Component, PropTypes } from 'react';
import shallowEquals from 'shallow-equals';

function mapPaths(mapPathsToProps, store) {
  const mappedPaths = {};
  Object.keys(mapPathsToProps).forEach((propName) => {
    const path = mapPathsToProps[propName];
    const value = store.getPath(path);
    mappedPaths[propName] = value;
  });

  return mappedPaths;
}

function mapCallbacks(mapCallbacksToProps, store) {
  const mappedCallbacks = {};
  Object.keys(mapCallbacksToProps).forEach((propName) => {
    mappedCallbacks[propName] = (...args) => mapCallbacksToProps[propName](store, ...args);
  });

  return mappedCallbacks;
}

export default class Path extends Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    mapCallbacksToProps: PropTypes.object,
    mapPathsToProps: PropTypes.object,
  };

  static defaultProps = {
    mapCallbacksToProps: {},
    mapPathsToProps: {},
  };

  static contextTypes = {
    wrangleStore: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.shouldUpdate = false;
    const store = this.store = context.wrangleStore;
    const mappedCallbacks = mapCallbacks(props.mapCallbacksToProps, store);
    const mappedPaths = mapPaths(props.mapPathsToProps, store);
    this.state = { mappedCallbacks, mappedPaths };
  }

  componentDidMount() {
    this.store.subscribe(this.onStoreChange);
  }

  componentWillReceiveProps(nextProps) {
    const { props, store } = this;

    const propsAreEqual = shallowEquals(props.mapPathsToProps, nextProps.mapPathsToProps) &&
      shallowEquals(props.mapCallbacksToProps, nextProps.mapCallbacksToProps);

    if (!propsAreEqual) {
      this.shouldUpdate = true;
      const mappedCallbacks = mapCallbacks(nextProps.mapCallbacksToProps);
      const mappedPaths = mapPaths(nextProps.mapPathsToProps, store);
      this.setState({ mappedCallbacks, mappedPaths });
    }
  }

  shouldComponentUpdate() {
    return this.shouldUpdate;
  }

  componentDidUpdate() {
    this.shouldUpdate = false;
  }

  componentWillUnmount() {
    if (this.store) {
      this.store.unsubscribe(this.onStoreChange);
      this.store = null;
    }
  }

  onStoreChange = (store) => {
    const { props } = this;
    const mappedPaths = mapPaths(props.mapPathsToProps, store);
    if (!shallowEquals(this.state.mappedPaths, mappedPaths)) {
      this.shouldUpdate = true;
      this.setState({ mappedPaths });
    }
  }

  render() {
    const ComponentClass = this.props.component;
    const props = {
      ...this.state.mappedPaths,
      ...this.state.mappedCallbacks,
    };

    return <ComponentClass {...props} />;
  }
}
