import { SearchAction } from './actions';

const initialState = {
	data: ""
};

function reducer(state, action) {
	switch (action.type) {
		case SearchAction.storeSearch:
			return {
				...state,
				data: action.value
			};
		case SearchAction.updateSearchValue:
			const data = { ...state.data };
			data.properties = { ...data.properties, ...{ value: action.searchValue } };
			return {
				...state,
				data
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;