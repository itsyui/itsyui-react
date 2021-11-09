import React from "react";
import createStore from './createStore';
import { appDispatcher } from './fnutils';

const initialState = {
};

function reducer(state, action) {
	switch (action.type) {
		case 'Action':
			return {
				...state,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

const reducerObject = {
	root: reducer
};

export const LayoutManagerContext = React.createContext('layoutManager');

class LayoutManager extends React.Component {

	componentWillMount() {
		// init the layout sub-state
		this.props.dispatcher.onNext({}, {});
	}

	render() {
		const value = {
			dispatcher: this.props.dispatcher,
			store: this.props.store
		};
		return (
			<LayoutManagerContext.Provider value={value}>
				{this.props.children}
			</LayoutManagerContext.Provider>
		);
	}
}

const LayoutManagerWidgetCreator = (WrappedComponent) => {
	const Extended = (props) => {
		// const dispatcher = props !== undefined && props.dispatcher || createDispatcher();
		const dispatcher = appDispatcher;
		// const store = createStore(dispatcher, reducerObject);
		// return <WrappedComponent {...props} store={store} dispatcher={dispatcher} />;
		return <WrappedComponent {...props} dispatcher={dispatcher} />;
	};
	return Extended;
};

export const LayoutManagerWidget = LayoutManagerWidgetCreator(LayoutManager);