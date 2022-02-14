import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import { Row, Col } from "react-bootstrap";
import { getlocaleText, getFormLabelClassName } from "../../utils/helper";

class InputTextArea extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const type = fieldSchema.type !== undefined ? fieldSchema.type : (fieldSchema.propertyType !== undefined ? fieldSchema.propertyType : "text");
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
			<>
				<Form.Group className={customClass} style={customStyle} controlId={fieldSchema.id}>
					<Form.Label className={getFormLabelClassName(fieldSchema)} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
					<div className="input-textbox">
						<Form.Control
							as="textarea"
							placeholder={placeHolder}
							type={type}
							rows={fieldSchema.rows ? fieldSchema.rows : "6"}
							required={fieldSchema.required}
							disabled={fieldSchema.readOnly}
							tabIndex={0}
							aria-label={controlProps.value !== undefined ? controlProps.value : ""}
							value={controlProps.value !== undefined ? controlProps.value : ""}
							className={controlProps.className ? controlProps.className : controlProps.error ? 'form-control error' : 'form-control'}
							onBlur={(v) => {
								controlProps.handleBlur && controlProps.handleBlur(v, v.target.value);
							}}
							onChange={e => controlProps.handleChange && controlProps.handleChange(e, e.target.value)}
						></Form.Control>
						{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)} className="helping-text">{getlocaleText(fieldSchema.helptext)}</Form.Text>}
						{controlProps.error &&
							<Form.Text aria-label={controlProps.error} id="component-error-text">{controlProps.error}</Form.Text>
						}
					</div>
				</Form.Group>
			</>
		);
	}
}

InputTextArea['displayName'] = 'InputTextAreaControl';

WidgetsFactory.instance.registerFactory(InputTextArea);
WidgetsFactory.instance.registerControls({
	textarea: 'InputTextAreaControl',
	'itsy:form:textarea': 'InputTextAreaControl'
});
