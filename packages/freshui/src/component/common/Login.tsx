import { getDefaultRegistry, getLocaleString, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Form, Row } from "react-bootstrap";
import { getDeviceType, getlocaleText } from "../../utils/helper";

interface ILoginWidgetProps {
	onLoginClick: any;
}
type LoginWidgetProps = IWidgetControlProps | ILoginWidgetProps;

const TenantLoginWidgetState = {
	FormState: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	},
};

const LoginPageComponent = props => {
	const { formSchema, formSchemaId, showForgotPasswordButton, showSignupButton, signupFormSchemaId, logo } = props.schema;
	const deviceType = getDeviceType();
	const matches = deviceType === "desktop" ? true : false;
	if (matches) {
		return (
			//desktop login page
			<Row className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
				<div className="desktopview">
					<div className="mobilepaper">
						<div className="login-logo">
							{logo ? <img alt="appLogo" src={logo} className="applogo" /> : <div className="default-applogo" />}
						</div>
						<div className="login-input-desktop">
							{props._getFormWidgetControlSchema(formSchema, formSchemaId)}
							<div className="login-button">
								<Button onClick={props.handleLogin} variant="primary" color="secondary" key="submit">
									{getLocaleString({ login: "{{login.submitButton}}" }, "login")}
								</Button>
								{showForgotPasswordButton && <Form.Text className={"forgotpassword"}>
									<a className="forgot_text" onClick={props.handleForgotPassword.bind(this)} hidden={showForgotPasswordButton === true ? undefined : true}>{getlocaleText("{{login.forgotPassword}}")}</a>
								</Form.Text>}
							</div>
						</div>
					</div>
					{showSignupButton && <div>
						<Form.Text className="signup-text">
							{getlocaleText("{{signupcontent}}")}
							<a className="signup-align" color="secondary" onClick={props.handleSignup.bind(this)} hidden={showSignupButton === true ? undefined : true}>{getlocaleText("{{signup}}")}</a>
						</Form.Text>
					</div>}
				</div>
			</Row>
		)
	} else {
		return (
			//mobileview login page
			<Row className={props.className ? `login_page_mobile contianer_login ${props.className}` : "login_page_mobile contianer_login"} style={props.style ? props.style : {}}>
				<div className="mobileview contianer_login">
					<div className="login_mobile_container">
						<div className="mobilepaper">
							<div className="login-logo">
								<img alt="appLogo" src={logo} className="applogo" />
							</div>
							<div className=" login-input">
								{props._getFormWidgetControlSchema(formSchema, formSchemaId)}
								<div className="login-button">
									<Button onClick={props.handleLogin.bind(this)} variant="primary" color="secondary" key="submit">
										{getLocaleString({ login: "{{login.submitButton}}" }, "login")}
									</Button>
									{showForgotPasswordButton && <Form.Text className={"forgotpassword"}>
										<a className="forgot_text" color="secondary" onClick={props.handleForgotPassword.bind(this)} hidden={showForgotPasswordButton === true ? undefined : true}>{getlocaleText("{{login.forgotPassword}}")}</a>
									</Form.Text>}
								</div>
							</div>
							{showSignupButton && <div>
								<Form.Text className="signup-text">
									{getlocaleText("{{signupcontent}}")}
									<a className="signup-align" color="secondary" onClick={props.handleSignup.bind(this)} hidden={showSignupButton === true ? undefined : true}>{getlocaleText("{{signup}}")}</a>
								</Form.Text>
							</div>}
						</div>
					</div>
				</div>
			</Row>
		);
	};
}
class LoginControl extends React.Component<LoginWidgetProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_getFormWidgetControlSchema(formSchema, formSchemaId) {
		const formWidgetControlSchema = {
			"name": "loginForm",
			"properties": {
				"ui:widget": "form",
				"typeId": "login",
				"isModal": true,
				"formSchemaId": formSchemaId,
				"formSchema": formSchema,
				"record": {
					"userName": "",
					"password": ""
				},
				"validateOnBlur": true,
				"autocompleteOff": process.env.MODE === "tablet"
			},
		};

		return <SchemaContainer key={"login"} schema={formWidgetControlSchema} />;
	}

	handleLogin() {
		this.props.transition({
			type: TenantLoginWidgetState.FormState.FORM_SUBMIT_CLICK
		});
	}
	handleForgotPassword(e) {
		e.preventDefault();
		this.props.transition({
			type: "NAVIGATE_URL",
			url: "/forgotpassword",
		});
	}

	handleSignup(e) {
		e.preventDefault();
		this.props.transition({
			type: "NAVIGATE_URL",
			url: "/signup",
		});
	}

	render() {
		const { formSchema, formSchemaId, showForgotPasswordButton, showSignupButton, signupFormSchemaId, logo, onLoginClick, className, style } = this._getControlSchemaProperties();
		return (
			<LoginPageComponent
				formSchema={formSchema}
				formSchemaId={formSchemaId}
				showForgotPasswordButton={showForgotPasswordButton}
				showSignupButton={showSignupButton}
				signupFormSchemaId={signupFormSchemaId}
				logo={logo}
				_getFormWidgetControlSchema={this._getFormWidgetControlSchema.bind(this)}
				handleLogin={onLoginClick}
				handleForgotPassword={this.handleForgotPassword.bind(this)}
				handleSignup={this.handleSignup.bind(this)}
				{...this.props}
				className={className}
				style={style}
			/>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const ItsyLoginPage = withReducer("LoginUIControl", mapDispatchToProps)(LoginControl);
ItsyLoginPage.displayName = "LoginUIControl";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(ItsyLoginPage);
WidgetsFactory.instance.registerControls({
	login_ui: "LoginUIControl",
	"itsy:ui:login": "LoginUIControl"
});
