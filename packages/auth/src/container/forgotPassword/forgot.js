import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React from "react";

const TenantForgotPassowrdWidgetState = {
    FormState: {
        FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
    },
};

class ForgotPasswordWidget extends React.Component {

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
        if (this.props.schema) {
            const schema = {
                name: "forgotpassword-ui-control",
                properties: {
                    ...this.props.schema,
                    "ui:widget": "forgot_password_ui",
                    onSubmitClick: this.handleSubmit.bind(this),
                }
            };
            return <SchemaContainer schema={schema} />;
        }
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {};
};

const ForgotPasswordWidgetC = withReducer("ForgotPasswordWidget", mapDispatchToProps)(ForgotPasswordWidget);
ForgotPasswordWidgetC.displayName = "ForgotPasswordWidget";

WidgetsFactory.instance.registerFactory(ForgotPasswordWidgetC);
WidgetsFactory.instance.registerControls({
    forgot_password: "ForgotPasswordWidget",
    'itsy:forgotpassword': "ForgotPasswordWidget"
});

export default ForgotPasswordWidgetC;
