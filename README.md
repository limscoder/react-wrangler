# react-wrangler

`react-wrangler` simplifies state management by using a declarative component API
to implement "one way data flow" and side effects.
It's composable components all the way down:
no actions, reducers, selectors, generators, middleware, thunks, sagas, query fragments, or observeables required.

## Why?

I am frustrated by the complexity of other state management libraries and inspired by [Ryan Florence's](https://github.com/ryanflorence) talk at [React Rally 2016](https://youtu.be/kp-NOggyz54).

One of the first things I learned when beginning react is that `props` serve as the public API for components.
It's a great concept because eliminating imperative function calls from the API makes components declarative and easily composable.
An entire react application is composed by defining a tree of react-elements and using event handlers to trigger state changes in response to user actions.
The `render->user action->update state->render` cycle is commonly referred to as "one way data flow".

This should be a very elegant solution to application development, but many state management frameworks force react developers to
struggle with imperative API calls invoked outside of the react-element render tree and allow side effects to be triggered from
anywhere in the application, making it difficult to reason about when and why side effects are triggered.

Does "one way data flow" need to be this complicated?
`react-wrangler` is an attempt to get back to basics and provide "one way data flow" with a simple, component based API.

## Run the demo app locally

[example demo app code](./examples/counter/App.js)

```bash
> git clone https://github.com/limscoder/react-wrangler
> cd react-wrangler
> npm i
> npm run example
> open http://localhost:9000
```

## Development

### Install

`react-wrangler` requires peer dependencies `immutable` and `react`.

```bash
> npm i immutable
> npm i react
> npm i react-wrangler
```

### Configure

The `Wrangle` component provides a single place to store your state, represented as an [immutable Map](https://facebook.github.io/immutable-js/docs/#/Map).
Pass the `initialState` prop to the `Wrangle` component to define the application's starting state.
It uses `context` to expose data to descendant components, so it should only be rendered once at the root of an application.

```javascript
import { fromJs } from 'immutable';

const initialState = fromJs({
  user: {
    id: '137af8eb-6baf-42a8-a38a-3df6fc36d562',
    display: 'username999',
    email: 'username999@wrangler.com',
    preferences: {
      showFirstTimeHelp: true
    }
  },
});

ReactDOM.render(
  <Wrangle initialState={ initialState }>
    <RootComponent />
  </Wrangle>
);
```

### Paths 

`paths` are strings used to reference nodes within `react-wrangler` state.

Using `initialState` from above:

```javascript
// path === 'user.id'
> '137af8eb-6baf-42a8-a38a-3df6fc36d562'

// path === 'user.preferences'
> Map({
  showFirstTimeHelp: true
})

// path === 'user.preferences.showFirstTimeHelp'
> true

// paths that are not present in state are undefined
// path === 'user.missing'
> undefined
```

### Path component

Use the `Path` component to retrieve `path` values from state and map them to `props`:

```javascript
import { Path } from 'react-wrangler';

function Welcome(props) {
  const { displayName, showFirstTimeHelp, onDismiss } = props;

  const firstTimeHelp = showFirstTimeHelp ?
    <FirstTimeHelp onDismiss={ onDismiss } /> : null;

  return (
    <div>
      <span>Welcome { displayName }</span>
      { firstTimeHelp }
    </div>);
}

function WrangledWelcome(props) {
  // map path values to props
  //
  // key === prop to map path value to
  // value === path
  const mapPathsToProps = {
    displayName: 'user.displayName',
    showFirstTimeHelp: 'user.preferences.showFirstTimeHelp'
  }

  // the `component` prop contains the component to
  // be rendered with paths mapped to props.
  return <Path component={ Welcome } mapPathsToProps={ mapPathsToProps } />;
}
```

### Mutation

An application isn't very useful if it can't mutate it's state.
Here is the example from above with state mutation in response to a user action:

```javascript
function onDismiss(store, ...args) {
  store.setPath('user.perferences.showFirstTimeHelp', false);
}

function WrangledWelcome(props) {
  // map callbacks to props
  //
  // key === prop to map callback to
  // value === callback function
  //
  // WARNING: using inline-closures for callbacks
  // will cause unnessecary vdom re-renders.
  // Use statically defined functions whenever possible.
  const mapCallbacksToProps = { onDismiss };
  const mapPathsToProps = { ... };

  return <Path component={ Welcome }
               mapPathsToProps={ mapPathsToProps }
               mapCallbacksToProps={ mapCallbacksToProps } />;
}
```

### Side effects

`react-wrangler` simplifies application logic by isolating all side effects into two callbacks.
`Wrangle.onMissingPaths` and `Wrangle.onStoreChange` are the only 2 functions that should invoke side effects within a `react-wrangler` application.

#### Fetching data

Use `Wrangle.onMissingPaths` to fetch data.
It's up to the implementer to determine how the missing path values are fetched:
 [Falcor](https://netflix.github.io/falcor/),
 [Graphql](http://graphql.org/),
 [Rest](https://en.wikipedia.org/wiki/Representational_state_transfer),
 [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
 [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html),
 etc.

`onMissingPaths` is called once-per-frame with an array of de-duplicated paths that have been requested, but are not present in state.
If network requests are required to fetch path values, it's recommended to batch
them together into the fewest number of requests required.

It's also important to note that `onMissingPaths` can be called multiple times with the same paths,
so implementers must be careful to avoid duplicate network requests.

```javascript
function onMissingPaths(store, missingPaths) {
  fetchPathsFromServer(missingPaths).then((pathValues) => {
    // call setPaths to update state and
    // re-render the view after pathValues are fetched.
    store.setPaths(pathValues);
  });
}

ReactDOM.render(
  <Wrangle onMissingPaths={ onMissingPaths }>
    <RootComponent />
  </Wrangle>
);
```

#### Persisting data

Use `Wrangle.onStoreChange` to persist data.
`onStoreChange` is called whenever `path` values are changed.
It's up to the implementer to determine how the path values are persisted,
such as `LocalStorage` or an API call that makes a network request.

```javascript
function onStoreChange(store, changedPaths) {
  updatePathsOnServer(changedPaths)
    .then(() => {
      store.setPath('showNotification': 'saved successfully');
    })
    .catch(() => {
      store.setPath('showNotification': 'failed to save');
    });
}

ReactDOM.render(
  <Wrangle onStoreChange={ onStoreChange }>
    <RootComponent />
  </Wrangle>
);
```

### Debugging

Set the `debug` prop to enable debugging messages in the console.

```javascript 
<Wrangle debug={true} />
```

Debugging messages include information about each state update.

```
> store changed (5): counter.current
 > elapsed time: 0.08500000000094587ms
 > changed paths: {counter.current: 92}
 > new state: {counter: {current: 92}}
 > type 'resetState(5)' in console to return to this state
```

Use the `resetState` function in the console to retreive any previous state for "time travel" debugging.
Use the `setPath` function in the console to manually update state
(object and array values are automatically converted to Immutable data structures).

### Optimization

`path` values should *always* be immutable so `Path.shouldComponentUpdate` can avoid unnessecary vdom re-renders.

```javascript
// don't set plain JS objects or arrays into state
setPath('user.preferences', { showFirstTimeHelp: true });

// use Immutable data structures instead
setPath('user.preferences', Immutable.fromJS({ showFirstTimeHelp: true }));
```

Invoking `setPath` triggers all `<Path />` components to check their state and possibly re-render, so it should be called as infrequently as possible.
If multiple paths need to be set at the same time, it's more efficient to invoke `setPaths` once instead of calling `setPath` multiple times:

```javascript
// set multiple paths in one call
setPaths({
  'user.preferences.showFirstTimeHelp': false,
  'user.displayName': 'Kathy'
});
```
