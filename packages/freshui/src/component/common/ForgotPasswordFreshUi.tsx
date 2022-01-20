import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Form, Row } from "react-bootstrap";
import { getDeviceType, getlocaleText } from "../../utils/helper";


const TenantForgotPassowrdWidgetState = {
	FormState: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	},
};

const ForgotpasswordPageComponent = props => {
	const { formSchema, showForgotPasswordButton, showSignupButton, signupFormSchemaId, logo } = props;
	const deviceType = getDeviceType();
	const matches = deviceType === "desktop" ? true : false;
	if (matches) {
		return (
			//desktop forgot page
			<Row className="login_page_desktop contianer_login">
				<div className="desktopview contianer_login">
					<div className="login_mobile_container">
						<div className="mobilepaper forgot_paper">
							<div className="login-logo">
								{logo ? <img alt="appLogo" tabIndex={0} src={logo} className="applogo" /> : <div tabIndex={0} className="default-applogo" />}
							</div>
							<div className="login-input-desktop">
								{props._getFormWidgetControlSchema(formSchema)}
								<div className="login-button">
									<Button className="forgot_submit" tabIndex={0} aria-label={getlocaleText("{{submit}}")} onClick={props.handleSubmit} variant="primary" color="secondary" key="submit">
										{getlocaleText("{{submit}}")}
									</Button>
								</div>
							</div>
							<div className="forgot-bost" >
								<Form.Text className="forgot-text">
									{getlocaleText("{{sigincontent}}")}
									<a className="signup-align" tabIndex={0} aria-label={getlocaleText("{{signin}}")} color="secondary" onClick={props.handleSignin.bind(this)}>{getlocaleText("{{signin}}")}</a>
								</Form.Text>
							</div>
						</div>
					</div>
				</div>
			</Row>);
	} else {
		return (
			<Row className="login_page_mobile contianer_login">
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
class ForgotPasswordWidget extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
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
			"name": "forgot_password",
			"properties": {
				"ui:widget": "form",
				"typeId": "forgotPassword",
				"isModal": true,
				"formSchema": formSchema,
				"validateOnBlur": true,
				"autocompleteOff": process.env.MODE === "tablet",
			},
		};

		return <SchemaContainer key={"forgot_password"} schema={formWidgetControlSchema} />;
	}

	render() {
		const { formSchema, signupFormSchemaId, logo, onSubmitClick } = this._getControlSchemaProperties();
		return (
			<ForgotpasswordPageComponent
				formSchema={formSchema}
				signupFormSchemaId={signupFormSchemaId}
				logo={logo}
				_getFormWidgetControlSchema={this._getFormWidgetControlSchema.bind(this)}
				handleSubmit={onSubmitClick}
				handleSignin={this.handleSignin.bind(this)}
				{...this.props}
			/>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const C = withReducer("ForgotPasswordControl", mapDispatchToProps)(ForgotPasswordWidget);
C.displayName = "ForgotPasswordControl";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(C);
WidgetsFactory.instance.registerControls({
	forgot_password_ui: "ForgotPasswordControl",
	"itsy:ui:forgotpassword": "ForgotPasswordControl"
});
