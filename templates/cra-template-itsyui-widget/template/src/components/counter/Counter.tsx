import React from 'react';
import { doBeforeCounterInc, doCounterInc, doCounterDec } from './actions';
import { useTransition } from "@itsy-ui/core";

const initialState = {
  count: 0
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        count: state.count + 1
      };
    case "DEC":
      return {
        ...state,
        count: state.count - 1
      };
    case "RESET":
      return {
        count: 0
      };
    default:
      return state === undefined ? initialState :
        Object.keys(state).length === 0 ? initialState : state;
  }
}

const stateJSON = {
  "initial": "onLoaded",
  "states": {
    "onLoaded": {
      "on": {
        "BEFORE_UP_COUNT": "beforeCounterInc",
        "DOWN_COUNT": "counterDec",
      }
    },
    "beforeCounterInc": {
      "onEntry": [
        "onBeforeCounterInc"
      ],
      "on": {
        "UP_COUNT": "counterInc"
      }
    },
    "counterInc": {
      "onEntry": [
        "onCounterInc"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
    "counterDec": {
      "onEntry": [
        "onCounterDec"
      ],
      "on": {
        "ON_LOADED": "onLoaded"
      }
    },
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onBeforeCounterInc: (evt: any) => dispatch(doBeforeCounterInc(evt)),
    onCounterInc: (evt: any) => dispatch(doCounterInc(evt)),
    onCounterDec: (evt: any) => dispatch(doCounterDec(evt))
  }
};

export function Counter() {
  const [state, transition] = useTransition("Counter", reducer, mapDispatchToProps, stateJSON);
  return (
    <div>
      <p>You clicked {state.count} times</p>
      <button onClick={() => transition({ type: "BEFORE_UP_COUNT" })}>
        ADD
      </button>
      <button onClick={() => transition({ type: "DOWN_COUNT" })}>
        DEC
      </button>
    </div>
  );
}
