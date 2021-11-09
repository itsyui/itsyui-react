import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Form } from 'react-bootstrap';
import { Row, Col } from "react-bootstrap";
import { getlocaleText } from "../../utils/helper";

class SwitchType extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		const id = `switchControl_${fieldSchema.id}`;
		if (controlProps.isReadonly) {
			return (
				<Form.Group className={customClass} style={customStyle}>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label >{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label>{controlProps.value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		return (
			<div className={`Switch-button ${customClass}`} style={customStyle}>
				<Form.Check
					id={id}
					type="switch"
					disabled={fieldSchema.readOnly ? true : false}
					checked={controlProps.value !== undefined ? controlProps.value : fieldSchema.checked ? fieldSchema.checked : false}
					value={fieldSchema.displayName}
					color="secondary"
					onChange={e => controlProps.handleChange && controlProps.handleChange(e, e.target.checked)}
					label={fieldSchema.displayName}
				/>
				{fieldSchema.helptext && <Form.Text>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
			</div>
		);
	}
}

SwitchType['displayName'] = 'SwitchTypeControl';

WidgetsFactory.instance.registerFactory(SwitchType);
WidgetsFactory.instance.registerControls({
	switch: 'SwitchTypeControl',
	'itsy:form:switch': 'SwitchTypeControl'
});