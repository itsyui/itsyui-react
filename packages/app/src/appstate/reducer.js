import { AppStateActions } from './actions';

const initialState = {
	appData: {}
};

function reducer(state, action) {
	switch (action.type) {
		case AppStateActions.AppDataAvailable:
			return {
				...state,
				appData: action.appData,
			};
		case AppStateActions.AppDataUpdate:
			return {
				...state,
				appData: { ...state.appData, extraParams: action.updatedContext }
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;
