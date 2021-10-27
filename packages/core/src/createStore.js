import { isObservable } from './fnutils';
import { Observable } from 'rx-lite';

const createStore = (dispatcher, reducersObject) => {
	const reducerKeys = Object.keys(reducersObject);
	const rootReducer =
		(state = {}, action = {}) => {
			const nextState = {};
			let hasChanged = false;
			for (let i = 0; i < reducerKeys.length; i += 1) {
				const key = reducerKeys[i];
				const reducer = reducersObject[key];
				const previousStateForKey = state[key];
				const nextStateForKey = reducer(previousStateForKey, action);
				nextState[key] = nextStateForKey;
				hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
			}
			return hasChanged ? nextState : state;
		};

	const injectReducer = (key, reducer) => {
		if (!(key in reducersObject)) {
			// only init once, since its in react rendering 
			// logic this might be called multiple times
			reducersObject[key] = reducer;
			reducerKeys.push(key);
		}
	};
	const selector = dispatcher
		.flatMap((action) => isObservable(action) ? action : Observable.from([action]))
		.startWith({})
		.scan(rootReducer)
		.distinctUntilChanged();
	return {
		injectReducer,
		selector
	};
};

export default createStore;