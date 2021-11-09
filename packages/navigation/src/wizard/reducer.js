import { WizardLayoutActions } from './actions';

const initialState = {
	typeId: "",
	stepControlSchema: {},
	extraParams: {}
};

function reducer(state, action) {
	switch (action.type) {
		case WizardLayoutActions.LoadControlSchema:
			return {
				...state,
				stepControlSchema: action.stepControlSchema,
				typeId: action.typeId,
				schemaId: action.schemaId,
				extraParams: action.extraParams
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;