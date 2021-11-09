import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Counter} from './components/counter/Counter';
import { StateManagerContext, DataLoaderFactory, WidgetsFactory, ICustomStateMachineProvider } from '@itsy-ui/core';

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider: ICustomStateMachineProvider = dataLoader.getLoader('customStateProvider') as ICustomStateMachineProvider;

// this function is called from AppContainer on initial load
function doCustomBeforeCounterInc(evt: any) {
  return async (_getState: any, _dispatch: any, transition: any) => {
    console.log(`Custom override hitting here with ${JSON.stringify(evt)}`);
    transition({
      type: "UP_COUNT"
    });
  }
}
const counterStateMachineOverride = {
  stateJSON: {
    "name": "counterState",
    "states": {
      "beforeCounterInc": {
        "onEntry": [
          "onCustomBeforeCounterInc"
        ],
        "on": {
          "UP_COUNT": "counterInc"
        }
      },
    },
  },
  mapDispatchToAction: (dispatch: any) => {
    return {
      onCustomBeforeCounterInc: (evt: any) => dispatch(doCustomBeforeCounterInc(evt)),
    };
  },
};
customStateProvider.registerCustomStateMachine("Counter", { pageId: "app" }, counterStateMachineOverride);

function App() {
  return (
    <div className="App">
      <div>
        <StateManagerContext.Provider key={'fsm'} value={{ contextPath: { pageId: "app" } }}>
          <Counter />
        </StateManagerContext.Provider>
      </div>
    </div>
  );
}

export default App;
