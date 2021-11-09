import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React from "react";

const TenantUserConfirmationWidgetState = {
    FormState: {
        FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
    },
};

class UserConfirmationWidget extends React.Component {

    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }
    handleSubmit() {
        this.props.transition({
            type: TenantUserConfirmationWidgetState.FormState.FORM_SUBMIT_CLICK
        });
    }

    render() {
        if (this.props.schema) {
            const schema = {
                name: "confirmation-ui-control",
                properties: {
                    ...this.props.schema,
                    "ui:widget": "confirmation_ui",
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

const UserConfirmationWidgetC = withReducer("UserConfirmationWidget", mapDispatchToProps)(UserConfirmationWidget);
UserConfirmationWidgetC.displayName = "UserConfirmationWidget";

WidgetsFactory.instance.registerFactory(UserConfirmationWidgetC);
WidgetsFactory.instance.registerControls({
    confirmation: "UserConfirmationWidget",
    'itsy:confirmation': "UserConfirmationWidget"
});

export default UserConfirmationWidgetC;
