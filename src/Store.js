import { Map, List } from 'immutable';
import instrumentStore from './instrumentStore';

const emptyMap = Map();
const emptyList = List();

export default class Store {
  constructor({ debug = false, initialState = emptyMap, onMissingPath = () => {} }) {
    this.state = initialState;
    this.changeListeners = emptyList;
    this.onMissingPath = onMissingPath;

    if (debug) {
      instrumentStore(this);
    }
  }

  getPath(path, defaultValue) {
    const key = path.split('.');
    if (this.state.hasIn(key)) {
      return this.state.getIn(key, defaultValue);
    }

    this.onMissingPath(this, path);
    return defaultValue;
  }

  setPath(path, value) {
    this.setPaths({ [path]: value });
  }

  setPaths(pathValues) {
    this.state = Object.keys(pathValues).reduce(
      (state, pathKey) => state.setIn(pathKey.split('.'),
      pathValues[pathKey]), this.state);

    this.changeListeners.forEach(listener => listener(this, pathValues));
  }

  subscribe(listener) {
    if (!this.changeListeners.includes(listener)) {
      this.changeListeners = this.changeListeners.push(listener);
    }
  }

  unsubscribe(listener) {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners = this.changeListeners.splice(index, 1);
    }
  }
}
