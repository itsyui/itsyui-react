import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import { getlocaleText } from "../../utils/helper";
import { Row, Col } from "react-bootstrap";

class SelectBoxControl extends React.Component<IWidgetControlProps, {}> {
	constructor(props) {
		super(props);
	}
	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getSelectOptions(options) {
		return Array.isArray(options) && options.map((t, index) => {
			if (t) {
				if (Object.prototype.toString.call(t) === "[object String]") {
					return <option key={index} value={t}>{getlocaleText(t)}</option>;
				} else {
					// expecting as key value object pair
					return <option key={index} value={t.key}>{getlocaleText(t.value)}</option>;
				}
			}
		});
	}

	getChipDisplayName(value: any, options: any) {
		if (options && Array.isArray(options)) {
			let val = "";
			options.forEach(t => {
				if (typeof t === "object") {
					if (t.key === value) { val = t.value };
				} else {
					if (t === value) { val = t };
				}
			});
			return val ? val : value;
		}
		return value;
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema, handleChange } = controlProps;
		const isMulti = fieldSchema.isMulti !== undefined && fieldSchema.isMulti !== null ? fieldSchema.isMulti : false;
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		if (controlProps.isReadonly) {
			const value = Array.isArray(controlProps.value) ? controlProps.value.join() : controlProps.value;
			return (
				<Form.Group className={customClass} style={customStyle}>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label className="read-only-label" tabIndex={0} aria-label={`${fieldSchema.displayName}:`}>{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label tabIndex={0} aria-label={value}>{value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		const fieldClass = controlProps.className ? `select-box ${controlProps.className} ${customClass}` : `select-box ${customClass}`
		return (fieldSchema.visibility === undefined || fieldSchema.visibility) &&
			<Form.Group className={fieldClass}
				controlId={fieldSchema.id}>
				<Form.Label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
				{isMulti ?
					<Form.Control as="select"
						className="select-option"
						tabIndex={0} 
						aria-label={controlProps.value ? controlProps.value : []}
						value={controlProps.value ? controlProps.value : []}
						disabled={fieldSchema.readOnly}
						onChange={e => { handleChange && handleChange(e, e.target.value) }}
						multiple={isMulti}
					>
						{fieldSchema.options !== undefined &&
							this.getSelectOptions(fieldSchema.options)
						}
					</Form.Control>
					:
					<Form.Control as="select"
						className="select-option"
						tabIndex={0} 
						aria-label={controlProps.value ? controlProps.value : "none"}
						value={controlProps.value ? controlProps.value : "none"}
						disabled={fieldSchema.readOnly}
						onChange={e => { handleChange(e, e.target.value) }}
					>
						<option key="Empty_value_dropdown" value="none" disabled hidden >{getlocaleText(fieldSchema.placeholderText)}</option>
						{fieldSchema.options !== undefined &&
							this.getSelectOptions(fieldSchema.options)
						}
					</Form.Control>
				}
				{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
				{controlProps.error && <Form.Text id="component-error-text" aria-label={controlProps.error}>{controlProps.error}</Form.Text>}
			</Form.Group>;
	}
}


SelectBoxControl['displayName'] = 'SelectBoxControl';

WidgetsFactory.instance.registerFactory(SelectBoxControl);
WidgetsFactory.instance.registerControls({
	dropdown_control: 'SelectBoxControl',
	'itsy:form:dropdown': 'SelectBoxControl'
});