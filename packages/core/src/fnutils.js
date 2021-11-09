import { Observable, BehaviorSubject } from 'rx-lite';
import WidgetFactory from './widgetsFactory';

export const isObservable = obs => obs instanceof Observable;
export const appDispatcher = new BehaviorSubject();
export const transitionDispatcher = new BehaviorSubject();

export const eventTransition = evt => {
	transitionDispatcher.onNext(evt);
}

export function createDispatcher() {
	return new BehaviorSubject();
}

export function combineReducers(reducersObject) {
	const keys = Object.keys(reducersObject);
	return (state = {}, action = {}) => keys.reduce((currState, key) => {
		const reducer = reducersObject[key];
		return {
			...currState,
			[key]: reducer(currState[key], action)
		};
	}, state);
}

export function actionCreator(dispatch, getState, transition, controlID) {
	const actionInvoker = (action) => {
		if (typeof action === 'function') {
			return actionFnInvoker(action);
		} else if (action && action !== undefined) {
			action.controlID = controlID;
			if (action.payload && action.payload !== undefined && isObservable(action.payload)) {
				dispatch.onNext(action.payload);
			} else {
				const data = action;
				dispatch.onNext(data);
			}
		}
	};

	const actionFnInvoker = (action) => {
		// if result of action is a function lambda, then we need to pass self 
		// function to it, so it can get back the data
		// if its a data then invoke the dispatcher
		if (typeof action === 'function') {
			var args = [getState, actionInvoker, transition];
			const funcResult = action.apply(null, args);
			if (funcResult !== undefined) {
				// recursive if the results are nested
				// return actionCreator(dispatch)(funcResult);
				return funcResult;
			}
		} else {
			actionInvoker(action);
		}
	};
	return (action) => {
		return actionFnInvoker(action);
	};
}

export function createSelector(dispatcher, reducer0) {
	return dispatcher
		.startWith({})
		.scan(reducer0)
		.distinctUntilChanged();
}

export function appDispatch(action) {
	const _dummyStateFactory = () => { };
	return actionCreator(appDispatcher, () => _dummyStateFactory())(action);
}

export function objectFilter(obj, predicate) {
	const r = Object.keys(obj)
		.filter(key => predicate(obj[key]))
		.map(key => ({ [key]: obj[key] }));
	if (r !== undefined && r !== null && Object.keys(r).length > 0) {
		return Object.assign(...r);
	} else {
		return {};
	}
}

export function arrayToObjectMap(items, keyFunc) {
	if (keyFunc === undefined) {
		throw new Error('Define keyFunc to get the key');
	}

	return items.reduce(function (map, obj) {
		map[keyFunc(obj)] = obj;
		return map;
	}, {});
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
export function chunkArray(myArray, chunk_size) {
	var results = [];

	while (myArray.length) {
		results.push(myArray.splice(0, chunk_size));
	}

	return results;
}

export function objectEntries(obj) {
	var ownProps = Object.keys(obj),
		i = ownProps.length,
		resArray = new Array(i); // preallocate the Array
	while (i--) {
		resArray[i] = [ownProps[i], obj[ownProps[i]]];
	}
	return resArray;
}

// Pass in the objects to merge as arguments.
// For a deep extend, set the first argument to `true`.
export function extend() {

	// Variables
	var extended = {};
	var deep = true;
	var i = 0;
	var length = arguments.length;

	// Check if a deep merge
	if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
		deep = arguments[0];
		i++;
	}

	// Merge the object into the extended object
	var merge = function (obj) {
		for (var prop in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, prop)) {
				// If deep merge and property is an object, merge properties
				if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
					extended[prop] = extend(true, extended[prop], obj[prop]);
				} else {
					extended[prop] = obj[prop];
				}
			}
		}
	};

	// Loop through each object and conduct a merge
	for (; i < length; i++) {
		var obj = arguments[i];
		merge(obj);
	}

	return extended;
}

export function getLocaleString(data, key) {
	const localeMsg = WidgetFactory.instance.services["appStateProvider"];
	const pattern = /[{{}}]/g;
	if (data && data.hasOwnProperty(key)) {
		if (data[key] && data[key].match(pattern) !== null) {
			const text = localeMsg.getLocaleData(data[key].substring(2, data[key].length - 2));
			return text ? text : data[key];
		} else {
			return data[key] ? data[key] : "";
		}
	} else {
		return "";
	}
}

export function createFilteredReducer(reducerFunction, reducerPredicate) {
	return (state, action) => {
		const isInitializationCall = state === undefined || Object.keys(state).length === 0;
		if (isInitializationCall) {
			return reducerFunction(state, action !== undefined ? action : {});
		}
		const shouldRunWrappedReducer = reducerPredicate(action);
		// Use this to check the flow of rendering
		// console.log(`key: ${key}; action: ${action.type}; this.controlID: ${action.controlID}; shouldRunWrappedReducer:${shouldRunWrappedReducer}`);
		return shouldRunWrappedReducer ? reducerFunction(state, action) : state;
	};
}