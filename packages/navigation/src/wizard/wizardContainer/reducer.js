import { WizardContainerActions } from './actions';

const initialState = {
	currentStep: 0,
	typeId: "",
	stepControlSchema: {},
	extraParams: {},
	currentStepContentSchema: {},
	stepStore: []
};

function reducer(state, action) {
	switch (action.type) {
		case WizardContainerActions.LoadProperties:
			return {
				...state,
				typeId: action.typeId,
				schemaId: action.schemaId,
				stepControlSchema: action.stepControlSchema,
				extraParams: action.extraParams
			};
		case WizardContainerActions.UpdateCurrentStepContentSchema:
			return {
				...state,
				currentStepContentSchema: action.currentStepContentSchema
			};
		case WizardContainerActions.UpdateStateValues: {
			let val = null;
			// if (state.stepStore.length == 0) {
			// 	val = state.stepStore.concat({ [state.currentStep]: action.data })
			// } else {
			// 	state.stepStore.splice(state.currentStep, 1, action.data);
			// 	val = state.stepStore;
			// }
			if (state.stepStore.hasOwnProperty(state.currentStep)) {
				state.stepStore.splice(state.currentStep, 1, action.data);
				val = state.stepStore;
			}
			else {
				val = state.stepStore.concat({ [state.currentStep]: action.data });
			}
			return {
				...state,
				stepStore: val
			};
		}
		case WizardContainerActions.OnNext:
			return {
				...state,
				currentStep: state.currentStep + 1
			};
		case WizardContainerActions.OnPrevious:
			return {
				...state,
				currentStep: state.currentStep - 1
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;