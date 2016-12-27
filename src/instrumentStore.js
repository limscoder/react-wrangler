/* eslint-disable no-console */
import Immutable from 'immutable';

function toJsPathValues(pathValues) {
  const jsPathValues = {};
  Object.keys(pathValues).forEach((path) => {
    const value = pathValues[path];
    jsPathValues[path] = value.toJS ? value.toJS() : value;
  });

  return jsPathValues;
}

function startGroup(groupDisplay) {
  if (console.groupCollapsed) {
    console.groupCollapsed(groupDisplay);
  } else if (console.group) {
    console.group(groupDisplay);
  } else {
    console.log(`--- ${groupDisplay} ---`);
  }
}

function endGroup() {
  if (console.groupEnd) {
    console.groupEnd();
  } else {
    console.log('------');
  }
}

function instrumentSetPaths(store, stateHistory) {
  let currentStateIndex = 1;
  const setPaths = store.setPaths;
  store.setPaths = (pathValues) => {
    const pathDisplay = Object.keys(pathValues).join(', ');
    const truncatedPathDisplay = pathDisplay.length > 80 ?
      `${pathDisplay.substr(0, 77)}...` : pathDisplay;
    const groupDisplay = `store changed (${currentStateIndex}): ${truncatedPathDisplay}`;
    startGroup(groupDisplay);

    const startMark = `start-${currentStateIndex}`;
    if (performance && performance.mark) {
      performance.mark(startMark);
    }

    setPaths.call(store, pathValues);
    stateHistory.push(store.state);

    const endMark = `end-${currentStateIndex}`;
    const measureName = `${startMark}-${endMark}`;
    if (performance && performance.mark) {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      const measurement = performance.getEntriesByName(measureName, 'measure')[0];
      console.log(`elapsed time: ${measurement.duration}ms`);
    }

    console.log('changed paths:', toJsPathValues(pathValues));
    console.log('new state:', store.state.toJS());
    console.log(`type 'resetState(${currentStateIndex})' in console to return to this state`);
    endGroup();

    currentStateIndex += 1;
  };
}

function resetState(store, stateHistory, stateIndex) {
  if (stateIndex < 0 || stateIndex >= stateHistory.length) {
    throw new Error(`invalid state index: ${stateIndex}`);
  }

  store.state = stateHistory[stateIndex];
  store.changeListeners.forEach(listener => listener(store, {}));

  return store.state.toJS();
}

function setPath(store, path, value) {
  if (value !== null && typeof value === 'object') {
    value = Immutable.fromJS(value);
  }

  store.setPath(path, value);
  return store.state.toJS();
}

export default function instrumentStore(store) {
  const stateHistory = [store.state];
  const globalContext = window || global;
  globalContext.setPath = (path, value) => setPath(store, path, value);
  globalContext.resetState = stateIndex => resetState(store, stateHistory, stateIndex);

  startGroup('store initialized');
  console.log('initial state', store.state.toJS());
  console.log("type `setPath('path.to.value', { foo: 'bar' })` in console to change state");
  console.log('type `resetState(0)` in console to return to initial state');
  endGroup();

  instrumentSetPaths(store, stateHistory);
}
