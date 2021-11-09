import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const Actions = {
	State: {
		TENANT_AUTH_FORM_SIGNUP: "TENANT_AUTH_FORM_SIGNUP",
	},
	FormState: {
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
	},
};
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");
function doSignupFormSubmit(data: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: Actions.State.TENANT_AUTH_FORM_SIGNUP,
			data: data,
		});
		transition({
			type: Actions.FormState.FORM_AFTER_SUBMIT,
		});
	};
}

const fvSignupStateMachine: ICustomStateMachineData = {
	stateJSON: {
		"states": {
			"formSubmit": {
				"onEntry": [
					"onSignupFormSubmit",
				],
				"on": {
					"FORM_AFTER_SUBMIT": "formAfterSubmit",
					"FORM_ERROR": "formError",
				},
			},
		},
	},
	mapDispatchToAction: (dispatch) => {
		return {
			onSignupFormSubmit: ({ values }) => dispatch(doSignupFormSubmit(values)),
		};
	},
};
const stateProps = {
	typeId: "signup",
};
customStateProvider.registerCustomStateMachine("FormWidget", stateProps, fvSignupStateMachine);
