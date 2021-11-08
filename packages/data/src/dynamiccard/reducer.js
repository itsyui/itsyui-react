const initialState = {
	cardJson: {},
	record: {}
};

function reducer(state, action) {
	switch (action.type) {
		case "UpdateSchema":
			return {
				...state,
				cardJson: action.cardJson,
				record: action.record,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;