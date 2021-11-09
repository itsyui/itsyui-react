import { TenantLoginActions } from './actions';

const initialState = {
	page: TenantLoginActions.view.TENANT_Login,
	controlSchema: null,
	errorMessage: null,
	properties: {},
};

function reducer(state, action) {
	switch (action.type) {
		case TenantLoginActions.UpdateControlSchema:
			return {
				...state,
				page: action.page,
				controlSchema: action.controlSchema,
				errorMessage: null
			};
		case TenantLoginActions.UpdateErrorMessage:
			return {
				...state,
				errorMessage: action.errorMessage
			};
		case TenantLoginActions.UpdateProperties:
			return {
				...state,
				properties: action.value,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;