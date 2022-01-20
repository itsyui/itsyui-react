import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { getlocaleText, getUrlParamValue } from "../../utils/helper";

class Confirmation extends React.Component<IWidgetControlProps, {}> {
    state = {
        showPassword: false,
        confirmationCode: "",
        textValue: ""
    }
    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }
    handleChange(event, count, index) {
        const textValue = this.state.textValue ? [this.state.textValue, event.target.value] : [event.target.value];
        this.setState({ textValue: textValue });
        if (count === index) {
            this.setState({ confirmationCode: textValue.toString().replace(/\,/g, "") });
        }
    }
    renderVerificationTextBox() {
        let { length } = this.getControlSchemaProperties();
        length = length ? length : 4; // by default am setting the code as 4
        const textBox = [];
        for (let index = 1; index <= length; index++) {
            textBox.push(<Form.Control
                type="text"
                id={"confirmationCode"}
                onChange={(event) => this.handleChange && this.handleChange(event, length, index)}
                className="verification-textBox"
            />)
        }
        return textBox;
    }
    handleSubmit() {
        this.props.transition({
            type: "FORM_SUBMIT_CLICK"
        })
    }
    renderPasswordField() {
        const controlSchema = {
            "name": "verification",
            "properties": {
                "ui:widget": "form",
                "isModal": true,
                "record": {
                    "confirmationCode": this.state.confirmationCode,
                    "email": atob(getUrlParamValue("em")),
                },
                "formSchema": {
                    "id": "password",
                    "propertyDefinitions": {
                        "password": {
                            "id": "password",
                            "displayName": "{{newPassword}}",
                            "className": "input-design",
                            "propertyType": "string",
                            "ui:widget": "text",
                            "type": "password",
                        },
                    },
                },
            },
        };
        return <>
            <Alert component="h1" variant="h5" tabIndex={0} aria-label={getlocaleText("{{common.password}}")}>
                {getlocaleText("{{common.password}}")}
            </Alert>
            <div className="control login-input-mar">
                <SchemaContainer schema={controlSchema} />
            </div>
            <div className="password-button-container">
                <div className="password-button">
                    <Button variant="primary" tabIndex={0} aria-label={getlocaleText("{{back}}")} onClick={() => { this.handleBackButton() }} fullWidth variant="contained" color="primary">
                        {getlocaleText("{{back}}")}
                    </Button>
                </div>
                <Button variant="primary" tabIndex={0} aria-label={getlocaleText("{{submit}}")} onClick={() => { this.handleSubmit() }} fullWidth variant="contained" color="primary">
                    {getlocaleText("{{submit}}")}
                </Button>
            </div>
        </>
    }
    handleNextButtonClick() {
        this.setState({ showPassword: true });
    }
    handleBackButton() {
        event.preventDefault();
        this.setState({ showPassword: false });
    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <Container component="main" maxWidth="md">
                        <CssBaseline />
                        {this.state.showPassword === false && <div className="verification-text">
                            <Alert component="h1" variant="h5" tabIndex={0} aria-label={getlocaleText("{{verification}}")}>
                                {getlocaleText("{{verification}}")}
                            </Alert>
                            <div className="verification-textbox-container" tabIndex={0}>
                                {this.renderVerificationTextBox()}
                            </div>
                            <Button variant="primary" onClick={() => { this.handleNextButtonClick() }}
                                fullWidth color="primary" key="next" tabIndex={0} aria-label={getlocaleText("{{next}}")}>
                                {getlocaleText("{{next}}")}
                            </Button>
                        </div>}
                        {this.state.showPassword && this.renderPasswordField()}
                    </Container>
                </header>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {};
};

const ConfirmationComponent = withReducer("Confirmation", mapDispatchToProps)(Confirmation);
ConfirmationComponent.displayName = "Confirmation";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(ConfirmationComponent);
WidgetsFactory.instance.registerControls({
    confirmation: "Confirmation",
});
