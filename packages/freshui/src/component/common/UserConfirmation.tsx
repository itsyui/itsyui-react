import { getDefaultRegistry, getLocaleString, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Form, Row } from "react-bootstrap";
import { getDeviceType, getlocaleText, getUrlParamValue } from "../../utils/helper";

const SignupVerificationWidgetState = {
	FormState: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	},
};

const UserVerificationPageComponent = props => {
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
								{logo ? <img alt="appLogo" src={logo} className="applogo" /> : <div className="default-applogo" />}
							</div>
							<div className="login-input-desktop">
								{props._getFormWidgetControlSchema(formSchema)}
								<div className="login-button">
									<Button className="confirm_submit" onClick={props.handleSubmit} variant="primary" color="secondary" key="submit">
										{getlocaleText("{{submit}}")}
									</Button>
								</div>
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
									<Button className="confirm_submit" onClick={props.handleSubmit.bind(this)} variant="primary" color="secondary" key="submit">
										{getlocaleText("{{submit}}")}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Row>
		);
	}
};
class UserConfirmationWidget extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_getFormWidgetControlSchema(formSchema) {
		const formWidgetControlSchema = {
			"name": "signupVerification",
			"properties": {
				"ui:widget": "form",
				"typeId": "signupVerification",
				"isModal": true,
				"formSchema": formSchema,
				"validateOnBlur": true,
				"record": {
					"fv:email": atob(getUrlParamValue("em")),
				},
				"autocompleteOff": process.env.MODE === "tablet",
			},
		};

		return <SchemaContainer key={"signupVerification"} schema={formWidgetControlSchema} />;
	}

	render() {
		const { formSchema, signupFormSchemaId, logo, onSubmitClick } = this._getControlSchemaProperties();
		return (
			<UserVerificationPageComponent
				formSchema={formSchema}
				signupFormSchemaId={signupFormSchemaId}
				logo={logo}
				_getFormWidgetControlSchema={this._getFormWidgetControlSchema.bind(this)}
				handleSubmit={onSubmitClick}
				{...this.props}
			/>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const C = withReducer("UserConfirmationControl", mapDispatchToProps)(UserConfirmationWidget);
C.displayName = "UserConfirmationControl";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(C);
WidgetsFactory.instance.registerControls({
	confirmation_ui: "UserConfirmationControl",
	"itsy:ui:userconfirmation": "UserConfirmationControl"
});
