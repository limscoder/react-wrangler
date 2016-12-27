import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map, Set } from 'immutable';

import Store from './Store';

function onNextFrame(func) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(func);
  } else {
    setTimeout(func, 16);
  }
}

export default class Wrangle extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    debug: PropTypes.bool,
    initialState: ImmutablePropTypes.map,
    onMissingPaths: PropTypes.func,
    onStoreChange: PropTypes.func,
  };

  static defaultProps = {
    children: <span />,
    debug: false,
    initialState: Map(),
  };

  static childContextTypes = {
    wrangleStore: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.missingPaths = Set();
    const storeConfig = {
      debug: props.debug,
      initialState: props.initialState,
      onMissingPath: this.onMissingPath,
    };
    this.store = new Store(storeConfig);
  }

  getChildContext() {
    return { wrangleStore: this.store };
  }

  componentDidMount() {
    this.store.subscribe(this.onStoreChange);
  }

  componentWillUnmount() {
    if (this.store) {
      this.store.unsubscribe(this.onStoreChange);
      this.store = null;
    }
  }

  onMissingPath = (store, missingPath) => {
    if (this.missingPaths.size === 0) {
      onNextFrame(() => {
        if (this.props.onMissingPaths) {
          this.props.onMissingPaths(store, this.missingPaths.toArray());
        }

        this.missingPaths = Set();
      });
    }

    this.missingPaths = this.missingPaths.add(missingPath);
  }

  onStoreChange = (store, changedPaths) => {
    if (this.props.onStoreChange && Object.keys(changedPaths).length) {
      this.props.onStoreChange(store, changedPaths);
    }
  }

  render() {
    return this.props.children;
  }
}
