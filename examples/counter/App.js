import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom';

import indexHtml from './index.html';
import Wrangle from '../../src/Wrangle';
import WrangledCounter from './WrangledCounter';

// use onMissingPaths to invoke side-effects
// such as data fetching
// when requested paths are not present in state
function onMissingPaths(store, missingPaths) {
  // setTimeout used to simulate an async data fetch
  setTimeout(() => {
    const pathValues = missingPaths.reduce((acc, path) => {
      const localValue = localStorage.getItem(path);
      const parsedValue = localValue === null ? 0 : JSON.parse(localValue);
      acc[path] = parsedValue;
      return acc;
    }, {});

    store.setPaths(pathValues);
  }, 1500);
}

// use onStoreChange to invoke side-effects
// such as persisting values when path values change
function onStoreChange(store, changedPaths) {
  Object.keys(changedPaths).forEach((path) => {
    const pathValue = changedPaths[path];
    localStorage.setItem(path, JSON.stringify(pathValue));
  });
}

function App() {
  // the root level component needs to be wrapped in <Wrangle />
  return (
    <Wrangle debug={true}
             onMissingPaths={onMissingPaths}
             onStoreChange={onStoreChange}>
      <WrangledCounter />
    </Wrangle>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
