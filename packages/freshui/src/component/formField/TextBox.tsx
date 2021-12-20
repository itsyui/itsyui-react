import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import { Row, Col } from "react-bootstrap";
import { getlocaleText } from "../../utils/helper";

class InputTextBox extends React.Component<IWidgetControlProps, {}> {

	constructor(props) {
		super(props);
		this.state = {
			showPassword: false,
		}
		this.visbileIconClick = this.visbileIconClick.bind(this);
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}
	visbileIconClick() {
		this.setState({
			showPassword: !this.state.showPassword,
		});
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema, gridStyle } = controlProps;
		const type = fieldSchema.type !== undefined ? fieldSchema.type : "text";
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		const placeHolder = fieldSchema.placeholderText ? fieldSchema.placeholderText : fieldSchema.placeholder ? fieldSchema.placeholder : "";
		if (controlProps.isReadonly) {
			return (
				<Form.Group className={customClass} style={customStyle}>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label className="read-only-label" tabIndex={0} aria-label={`${fieldSchema.displayName}:`}>{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label tabIndex={0} aria-label={controlProps.value}>{controlProps.value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		return (
			(fieldSchema.visibility === undefined || fieldSchema.visibility) &&
			<>
				<Form.Group className={customClass} style={customStyle} controlId={fieldSchema.id}>
					<Form.Label className="text-label" tabIndex={0} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
					<div className="input-textbox">
						<Form.Control
							type={type === "password" ? this.state.showPassword ? "text" : "password" : type}
							required={fieldSchema.required}
							disabled={fieldSchema.readOnly}
							placeholder={placeHolder}
							tabIndex={0}
							aria-label={controlProps.value !== undefined ? controlProps.value : ""}
							value={controlProps.value !== undefined ? controlProps.value : ""}
							className={controlProps.error ? 'form-control error' : 'form-control'}
							onBlur={(v) => {
								controlProps.handleBlur &&
									controlProps.handleBlur(v, v.target.value);
							}}
							onChange={e => controlProps.handleChange && controlProps.handleChange(e, e.target.value)}
						/>
						{fieldSchema.helptext && <Form.Text tabIndex={0} aria-label={getlocaleText(fieldSchema.helptext)} className="helping-text">{getlocaleText(fieldSchema.helptext)}</Form.Text>}
						{controlProps.error &&
							<Form.Text tabIndex={0} aria-label={controlProps.error} id="component-error-text">{controlProps.error}</Form.Text>
						}
					</div>
				</Form.Group>
			</>
		);
	}
}

InputTextBox['displayName'] = 'InputTextBox';

WidgetsFactory.instance.registerFactory(InputTextBox);
WidgetsFactory.instance.registerControls({
	string: "InputTextBox",
	text: "InputTextBox",
	'itsy:form:textbox': "InputTextBox"
});