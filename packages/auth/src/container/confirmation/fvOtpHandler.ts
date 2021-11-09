import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";
const Actions = {
	State: {
		TENANT_AUTH_FORM_VERIFY_OTP: "TENANT_AUTH_FORM_VERIFY_OTP",
	},
	FormState: {
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
	},
};

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

function doVerifyOtp(data: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: Actions.State.TENANT_AUTH_FORM_VERIFY_OTP,
			data: data,
		});
		transition({
			type: Actions.FormState.FORM_AFTER_SUBMIT,
		});
	};
}

const fvVerifyOtpStateMachine: ICustomStateMachineData = {
	stateJSON: {
		"states": {
			"formSubmit": {
				"onEntry": [
					"onVerifyOtp",
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
			onVerifyOtp: ({ values }) => dispatch(doVerifyOtp(values)),
		};
	},
};
const stateProps = {
	typeId: "signupVerification",
};
customStateProvider.registerCustomStateMachine("FormWidget", stateProps, fvVerifyOtpStateMachine);
