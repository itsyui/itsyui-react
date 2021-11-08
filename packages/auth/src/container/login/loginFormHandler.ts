import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

const Actions = {
	State: {
		TENANT_AUTH_FORM_LOGIN: "TENANT_AUTH_FORM_LOGIN",
	},
	FormState: {
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
	},
};

function doLoginFormSubmit(values: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: Actions.State.TENANT_AUTH_FORM_LOGIN,
			username: values.userName,
			password: values.password,
		});
		transition({
			type: Actions.FormState.FORM_AFTER_SUBMIT,
		});
		transition({
			type: "MOBILE_KEYBOARD_HIDE",
		});
	};
}

const loginFormStateMachine: ICustomStateMachineData = {
	stateJSON: {
		"states": {
			"formSubmit": {
				"onEntry": [
					"onLoginFormSubmit",
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
			onLoginFormSubmit: ({ values }) => dispatch(doLoginFormSubmit(values)),
		};
	},
};

customStateProvider.registerCustomStateMachine("FormWidget", { typeId: "login" }, loginFormStateMachine);
