import { getDefaultRegistry, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from '@itsy-ui/core';
import React from 'react';
import { Route, withRouter } from "react-router-dom";
import {
	doFormAfterForgotPasswordRender, doFormAfterLoginRender,
	doFormAfterSignupRender,

	doFormAfterVerificationRender, doFormBeforeForgotPasswordRender, doFormBeforeLoginRender,
	doFormBeforeSignupRender,
	doFormBeforeVerificationRender, doFormConfirmUser,
	doFormForgotPassword, doFormSignup, doLoginFailureShowError, doLoginSubmit,

	doTenantShowError, doVerifyOtp, onUpdateProperties, TenantLoginActions
} from "./actions";
import reducer from './reducer';

const errorMessage = { color: 'red', textAlign: "center", display: "block", fontSize: "20px" };

const _getCustomState = () => {
	return {
		contextPath: {
			typeId: "signup",
		},
	};
};

const _getCustomStateVerification = () => {
	return {
		contextPath: {
			typeId: "signupVerification",
		},
	};
};

const _getCustomStateForgotPassword = () => {
	return {
		contextPath: {
			typeId: "forgotPassword",
		}
	};
};

const _getLoginCustomState = () => {
	return {
		contextPath: {
			typeId: "login",
		},
	};
};

const Login = (props) => {
	return <StateManagerContext.Provider key="login-provider" value={_getLoginCustomState()}>
		{props.errorMessage != null && <label style={errorMessage}>{props.errorMessage}</label>}
		<SchemaContainer schema={props.controlSchema} />
	</StateManagerContext.Provider >;
};

const Signup = (props) => {
	return <StateManagerContext.Provider key="signup-provider" value={_getCustomState()}>
		{props.errorMessage != null && <label style={errorMessage}>{props.errorMessage}</label>}
		<SchemaContainer schema={props.controlSchema} />
	</StateManagerContext.Provider>;

};

const Forgot = (props) => {
	return <StateManagerContext.Provider key="forgotpwd-provider" value={_getCustomStateForgotPassword()}>
		{props.errorMessage != null && <label style={errorMessage}>{props.errorMessage}</label>}
		<SchemaContainer schema={props.controlSchema} />
	</StateManagerContext.Provider>;
};

const Verification = (props) => {
	return <StateManagerContext.Provider key="otp_verification-provider" value={_getCustomStateVerification()}>
		{props.errorMessage != null && <label style={errorMessage}>{props.errorMessage}</label>}
		<SchemaContainer schema={props.controlSchema} />
	</StateManagerContext.Provider>;
};

const routeMatches = {
	login: TenantLoginActions.State.TENANT_SHOW_LOGIN,
	forgotpassword: TenantLoginActions.State.TENANT_SHOW_FORGOT,
	signup: TenantLoginActions.State.TENANT_SHOW_SIGNUP,
	verification: TenantLoginActions.State.TENANT_SHOW_VERIFICATION
};

class AuthContainer extends React.Component {
	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		const { history } = this.props;
		this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
		this.handleLocationChange(history.location);
		const { showForgotPassword, showSignup, signupFormSchemaId, showLoadingIndicator, themeView, logo, loginFormSchemaId } = this.getControlSchemaProperties();
		const properties = {
			showForgotPassword: showForgotPassword,
			showSignup: showSignup,
			signupFormSchemaId: signupFormSchemaId,
			showLoadingIndicator: showLoadingIndicator,
			themeView: themeView,
			logo: logo,
			loginFormSchemaId: loginFormSchemaId,
		};
		this.props.updateProperties(properties);
		this.props.transition({
			type: TenantLoginActions.State.TENANT_AUTH_FORM_BEFORE_LOGIN_RENDER,
			showForgotPasswordButton: showForgotPassword,
			showSignupButton: showSignup,
			signupFormSchemaId: signupFormSchemaId,
			logo: logo,
			loginFormSchemaId: loginFormSchemaId,
		});
	}

	handleLocationChange = (location) => {
		// console.log('auth location changed: ', location, this.props.page);
		const path = location.pathname.substring(1, location.pathname.length);
		// user has clicked back button or navigated with AUTH urls so transition accordingly
		if (routeMatches[path] !== this.props.page) {
			if (path === "login") {
				const { showForgotPassword, showSignup, signupFormSchemaId, logo, loginFormSchemaId } = this.getControlSchemaProperties();
				this.props.transition({
					type: TenantLoginActions.State.TENANT_AUTH_FORM_BEFORE_LOGIN_RENDER,
					showForgotPasswordButton: showForgotPassword,
					showSignupButton: showSignup,
					signupFormSchemaId: signupFormSchemaId,
					logo: logo,
					loginFormSchemaId: loginFormSchemaId,
				});
			} else if (path === "forgotpassword") {
				const { logo } = this.getControlSchemaProperties();
				this.props.transition({
					type: TenantLoginActions.State.TENANT_AUTH_FORM_BEFORE_FORGOT_PASSWORD_RENDER,
					logo: logo,
				});
			} else if (path === "signup") {
				const { signupFormSchemaId, logo } = this.getControlSchemaProperties();
				this.props.transition({
					type: TenantLoginActions.State.TENANT_AUTH_FORM_BEFORE_SIGNUP_RENDER,
					signupFormSchemaId: signupFormSchemaId,
					logo: logo,
				});
			} else if (path === "verification") {
				const { logo } = this.getControlSchemaProperties();
				this.props.transition({
					type: TenantLoginActions.State.TENANT_AUTH_CONFIRM_USER_FORM,
					logo: logo,
				});
			} else {
				if (this.props.page !== null && this.props.controlSchema !== null) {
					// adding this check to ensure this logic is executed only after login page is loaded
					// initially on page load with / path it will hit this code, which will affect the appwidget state JSON flow
					this.props.transition({
						type: "NAVIGATE_URL",
						url: `/login`,
					});
				}
			}
		}
	}

	componentWillUnmount() {
		if (this.unsubscribeFromHistory) {
			this.unsubscribeFromHistory();
		}
	}

	_getRoutedAuthLayout(page, controlSchema, transition, errorMessage) {
		switch (page) {
			case "TENANT_SHOW_LOGIN":
				return <Login controlSchema={controlSchema} errorMessage={errorMessage} />;
			case "TENANT_SHOW_SIGNUP":
				return <Signup controlSchema={controlSchema} transition={transition} errorMessage={errorMessage} />;
			case "TENANT_SHOW_FORGOT":
				return <Forgot controlSchema={controlSchema} errorMessage={errorMessage} />;
			case "TENANT_SHOW_VERIFICATION":
				return <Verification controlSchema={controlSchema} errorMessage={errorMessage} />;
		}
	}

	render() {
		if (this.props.page != null && this.props.controlSchema !== null) {
			const authLayoutControlSchema = {
				name: "auth-layout",
				properties: {
					"ui:widget": "auth_layout",
					page: this.props.page,
					controlSchema: this.props.controlSchema,
					themeView: this.props.properties.themeView,
				}
			};
			return (
				<SchemaContainer schema={authLayoutControlSchema}>
					{this._getRoutedAuthLayout(this.props.page, this.props.controlSchema, this.props.transition, this.props.errorMessage)}
				</SchemaContainer>
			);
		} else {
			return <label>loading...</label>;
		}
	}
}

// const AuthContainerWidget = Form.create()(AuthContainer);

const mapDispatchToProps = (dispatch) => {
	return {
		onFormBeforeLoginRender: (event) => dispatch(doFormBeforeLoginRender(event)),
		onFormAfterLoginRender: ({ loginSchema }) => dispatch(doFormAfterLoginRender(loginSchema)),
		onLoginValidate: ({ username, password }) => dispatch(doLoginSubmit(username, password)),
		onLoginFailureShowError: ({ error }) => (dispatch(doLoginFailureShowError(error))),
		onFormConfirmUser: (data) => (dispatch(doFormConfirmUser(data))),
		onFormBeforeSignupRender: (data) => (dispatch(doFormBeforeSignupRender(data))),
		onFormAfterSignupRender: ({ signupSchema }) => (dispatch(doFormAfterSignupRender(signupSchema))),
		onFormBeforeForgotPasswordRender: (data) => dispatch(doFormBeforeForgotPasswordRender(data)),
		onFormAfterForgotPasswordRender: ({ forgotPasswordSchema }) => dispatch(doFormAfterForgotPasswordRender(forgotPasswordSchema)),
		onFormSignup: ({ data }) => dispatch(doFormSignup(data)),
		onFormForgotPassword: ({ data }) => dispatch(doFormForgotPassword(data)),
		onVerifyOtp: ({ data }) => dispatch(doVerifyOtp(data)),
		onTenantShowError: ({ data, errorCode }) => dispatch(doTenantShowError(data, errorCode)),
		updateProperties: (value) => dispatch(onUpdateProperties(value)),
		onFormBeforeVerificationRender: (data) => dispatch(doFormBeforeVerificationRender(data)),
		onFormAfterVerificationRender: ({ verificaitonSchema }) => dispatch(doFormAfterVerificationRender(verificaitonSchema)),
	};
};

import stateJSON from "./state.json";
const C = withReducer('AuthContainerWidget', reducer, mapDispatchToProps, stateJSON)(withRouter(AuthContainer));
C.displayName = 'AuthContainerWidget';

WidgetsFactory.instance.registerFactory(C);
WidgetsFactory.instance.registerControls({
	tenant_container: 'AuthContainerWidget',
	'itsy:authcontainer': 'AuthContainerWidget'
});

