import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Form, Row } from "react-bootstrap";
import { getDeviceType, getlocaleText } from "../../utils/helper";

const SignupVerificationWidgetState = {
	FormState: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	},
};
const SignUpPageComponent = props => {
	const { formSchema, showForgotPasswordButton, showSignupButton, signupFormSchemaId, logo, className, style } = props;
	const deviceType = getDeviceType();
	const matches = deviceType === "desktop" ? true : false;
	if (matches) {
		return (
			//desktop login page
			<Row className={className ? `sign-up-root ${className}` : "sign-up-root"} style={style ? style : {}}>
				<div className="signup-contianer">
					<div className="signup-paper">
						<div className="login-logo">
							{logo ? <img alt="appLogo" tabIndex={0} src={logo} className="applogo" /> : <div className="default-applogo" />}
						</div>
						<div className="login-input-desktop">
							{props._getFormWidgetControlSchema(formSchema)}
							<div className="login-button">
								<Button className="MuiFormControl-marginNormal" tabIndex={0} onClick={props.handleSubmit} variant="primary" color="secondary" key="submit" aria-label={getlocaleText("{{submit}}")}>
									{getlocaleText("{{submit}}")}
								</Button>
							</div>
						</div>
					</div>
					<div className="signup-bost" >
						<Form.Text className="signup-text">
							{getlocaleText("{{sigincontent}}")}
							<a className="signup-align" color="secondary" onClick={props.handleSignin.bind(this)}>{getlocaleText("{{signin}}")}</a>
						</Form.Text>
					</div>
				</div>
			</Row>);
	} else {
		return (
			<Row className={className ? `login_page_mobile contianer_login ${className}` : "login_page_mobile contianer_login"} style={style ? style : {}}>
				<div className="mobileview contianer_login">
					<div className="login_mobile_container">
						<div className="mobilepaper">
							<div className="login-logo">
								<img alt="appLogo" src={logo} className="applogo" />
							</div>
							<div className=" login-input">
								{props._getFormWidgetControlSchema(formSchema)}
								<div className="login-button">
									<Button className="MuiFormControl-marginNormal" onClick={props.handleSubmit.bind(this)} variant="primary" color="secondary" key="submit">
										{getlocaleText("{{submit}}")}
									</Button>
								</div>
							</div>
							<div className="signup-bost" >
								<Form.Text className="signup-text">
									{getlocaleText("{{sigincontent}}")}
									<a className="signup-align" color="secondary" onClick={props.handleSignin.bind(this)}>{getlocaleText("{{signin}}")}</a>
								</Form.Text>
							</div>
						</div>
					</div>
				</div>
			</Row>
		);
	}
};
class SignUpPageWidget extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleSubmit(e) {
		this.props.transition({
			type: SignupVerificationWidgetState.FormState.FORM_SUBMIT_CLICK
		});
	}
	handleSignin(e) {
		e.preventDefault();
		this.props.transition({
			type: "NAVIGATE_URL",
			url: "/login",
		});
	}
	_getFormWidgetControlSchema(formSchema) {
		const formWidgetControlSchema = {
			"name": "signup",
			"properties": {
				"ui:widget": "form",
				"typeId": "signup",
				"isModal": true,
				"formSchema": formSchema,
				"validateOnBlur": true,
				"autocompleteOff": process.env.MODE === "tablet",
			},
		};

		return <SchemaContainer key={"signup"} schema={formWidgetControlSchema} />;
	}

	render() {
		const { formSchema, signupFormSchemaId, logo, onSignUpClick, className, style } = this._getControlSchemaProperties();
		return (
			<SignUpPageComponent
				formSchema={formSchema}
				signupFormSchemaId={signupFormSchemaId}
				logo={logo}
				_getFormWidgetControlSchema={this._getFormWidgetControlSchema.bind(this)}
				handleSubmit={onSignUpClick}
				handleSignin={this.handleSignin.bind(this)}
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

const ItsySignUpPage = withReducer("SignUpUIControl", mapDispatchToProps)(SignUpPageWidget);
ItsySignUpPage.displayName = "SignUpUIControl";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(ItsySignUpPage);
WidgetsFactory.instance.registerControls({
	signup_ui: "SignUpUIControl",
	"itsy:ui:signup": "SignUpUIControl"
});
