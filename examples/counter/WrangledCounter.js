import React from 'react';
import Path from '../../src/Path';
import Counter from './Counter';

const counterPath = 'counter.current';

function LoadingCounter(props) {
  return (
    <div style={{ margin: '20px' }}>
      {
        typeof props.count === 'undefined' ?
          <span>simulating async operation...</span> : <Counter {...props} />
      }
    </div>
  );
}
LoadingCounter.propTypes = Counter.propTypes;

function onIncrement(store) {
  store.setPath(counterPath, store.getPath(counterPath) + 1);
}

function onDecrement(store) {
  store.setPath(counterPath, store.getPath(counterPath) - 1);
}

function onReset(store) {
  store.setPath(counterPath, 0);
}

export default function WrangledCounter() {
  // map path values to prop names
  const mapPathsToProps = { count: counterPath };

  // map callback functions to prop names
  const mapCallbacksToProps = {
    onIncrement,
    onDecrement,
    onReset,
  };

  return (
    <Path component={LoadingCounter}
          mapPathsToProps={mapPathsToProps}
          mapCallbacksToProps={mapCallbacksToProps} />
  );
}
