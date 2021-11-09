import { NavbarActions } from './actions';

const initialState = {
	data: {},
	selectedItems: []
};

function reducer(state, action) {
	switch (action.type) {
		case NavbarActions.LoadMetadata:
			return {
				...state,
				data: action.data
			};
		case NavbarActions.SelectNavbarItem:
			return {
				...state,
				selectedItems: action.data
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;