import React, { PropTypes } from 'react';

export default function Counter(props) {
  return (
    <div>
      <span>counted clicks: {props.count}</span>
      <br />
      <button onClick={props.onIncrement}>Increment</button>&nbsp;
      <button onClick={props.onDecrement}>Decrement</button>&nbsp;
      <button onClick={props.onReset}>Reset</button>&nbsp;
    </div>
  );
}
Counter.propTypes = {
  count: PropTypes.number,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func,
  onReset: PropTypes.func,
};
