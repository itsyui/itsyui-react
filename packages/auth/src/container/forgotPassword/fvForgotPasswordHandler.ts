import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";

const Actions = {
	State: {
		TENANT_AUTH_FORM_FORGOT_PASSWORD: "TENANT_AUTH_FORM_FORGOT_PASSWORD",
	},
	FormState: {
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
	},
};

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

function doForgotPasswordForm(data: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: Actions.State.TENANT_AUTH_FORM_FORGOT_PASSWORD,
			data: data,
		});
		transition({
			type: Actions.FormState.FORM_AFTER_SUBMIT,
		});
	};
}

const fvForgotPasswordStateMachine: ICustomStateMachineData = {
	stateJSON: {
		"states": {
			"formSubmit": {
				"onEntry": [
					"onFogotPasswordForm",
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
			onFogotPasswordForm: ({ values }) => dispatch(doForgotPasswordForm(values)),
		};
	},
};
const stateProps = {
	typeId: "forgotPassword",
};
customStateProvider.registerCustomStateMachine("FormWidget", stateProps, fvForgotPasswordStateMachine);
