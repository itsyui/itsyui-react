const initialState = {
	title: ""
};

function reducer(state, action) {
	switch (action.type) {
		case "UPDATE_LABEL":
			return {
				...state,
				title: action.title,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;