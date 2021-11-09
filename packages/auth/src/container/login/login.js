import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React from "react";
import { getLoginSchema } from "../utils";
import "./loginFormHandler";
import "./Login.css";
import "./locale";


const TenantLoginWidgetState = {
	State: {
		TENANT_AUTH_FORM_BEFORE_SIGNUP_RENDER: "TENANT_AUTH_FORM_BEFORE_SIGNUP_RENDER",
		TENANT_AUTH_FORM_BEFORE_FORGOT_PASSWORD_RENDER: "TENANT_AUTH_FORM_BEFORE_FORGOT_PASSWORD_RENDER",
	},
	FormState: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	}
};

class LoginWidget extends React.Component {
	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleForgotPassword(e) {
		e.preventDefault();
		this.props.transition({
			type: "NAVIGATE_URL",
			url: "/forgotpassword",
		});
	}

	handleSignup(signupFormSchemaId, e) {
		e.preventDefault();
		this.props.transition({
			type: "NAVIGATE_URL",
			url: "/signup",
		});
	}

	handleLogin() {
		this.props.transition({
			type: TenantLoginWidgetState.FormState.FORM_SUBMIT_CLICK
		});
	}

	render() {
		const loginSchema = this.props.schema ? this.props.schema : getLoginSchema().properties;
		const schema = {
			name: "login-ui-control",
			properties: {
				...loginSchema,
				"ui:widget": "login_ui",
				onLoginClick: this.handleLogin.bind(this),
				className: this.props.className,
				style: this.props.style
			}
		};
		return <SchemaContainer schema={schema} />;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const LoginWidgetC = withReducer("LoginWidget", mapDispatchToProps)(LoginWidget);
LoginWidgetC.displayName = "LoginWidget";

WidgetsFactory.instance.registerFactory(LoginWidgetC);
WidgetsFactory.instance.registerControls({
	login: "LoginWidget",
	'itsy:login': "LoginWidget"
});

export default LoginWidgetC;