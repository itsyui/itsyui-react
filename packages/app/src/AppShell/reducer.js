import { AppShellActions } from "./actions";

const initialState = {
	loadApp: false
};

function reducer(state, action) {
	switch (action.type) {
		case AppShellActions.AppShellLoad:
			return {
				...state,
				loadApp: true,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;