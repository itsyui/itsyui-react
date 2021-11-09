import { ToolbarActions } from './actions';

const initialState = {
	items: [],
	typeId: "",
	contextParams: {},
	loaded: false
};

function reducer(state, action) {
	switch (action.type) {
		case ToolbarActions.Init: 
			return {
				...state,
				typeId: action.typeId,
				contextParams: {
					...state.contextParams,
					...action.contextParams
				}
			};
		case ToolbarActions.LoadData:
			return {
				...state,
				items: [...action.items],
				contextParams: {
					...state.contextParams,
					...action.contextParams
				},
				loaded: true
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;
