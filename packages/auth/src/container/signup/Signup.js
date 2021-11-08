import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React from "react";
import { getSignupSchema } from "../utils";
import "./fvSignupFormHandler";
import "./locale";

const TenantForgotPassowrdWidgetState = {
    FormState: {
        FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
    },
};

class SignupWidget extends React.Component {
    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    handleSubmit() {
        this.props.transition({
            type: TenantForgotPassowrdWidgetState.FormState.FORM_SUBMIT_CLICK
        });
    }

    handleSignin(e) {
        e.preventDefault();
        this.props.transition({
            type: "NAVIGATE_URL",
            url: "/login",
        });
    }

    render() {
        const signupSchema = this.props.schema ? this.props.schema : getSignupSchema().properties;
        const schema = {
            name: "signup-ui-control",
            properties: {
                ...signupSchema,
                "ui:widget": "signup_ui",
                onSignUpClick: this.handleSubmit.bind(this),
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

const SignupWidgetC = withReducer("SignupWidget", mapDispatchToProps)(SignupWidget);
SignupWidgetC.displayName = "SignupWidget";

WidgetsFactory.instance.registerFactory(SignupWidgetC);
WidgetsFactory.instance.registerControls({
    signup: "SignupWidget",
    'itsy:signup': "SignupWidget"
});

export default SignupWidgetC;
