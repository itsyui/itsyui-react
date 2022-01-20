import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { getlocaleText } from "../../utils/helper";

class CheckBoxControl extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getCheckOptions = (options: any, controlProps) => {
		let result = [];
		if (options) {
			const { value, handleChange } = controlProps;
			result = options.map(t => {
				const key = typeof t === "string" ? t : t.key;
				const itemValue = typeof t === "string" ? t : t.value;
				const selectedIndex = Array.isArray(value) && value.includes(key);
				return <Form.Check
					type="checkbox"
					name={controlProps.fieldSchema.id}
					checked={selectedIndex ? true : false}
					id={`${controlProps.fieldSchema.id}-${key}`}
					key={key}
					value={key}
					label={itemValue}
					onChange={e => handleChange && handleChange(e, e.target.value)}
					tabIndex={0}
				/>;
			});
		}
		return result;
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		if (controlProps.isReadonly) {
			const value = Array.isArray(controlProps.value) ? controlProps.value.join() : controlProps.value;
			return (
				<Form.Group style={customStyle} className={customClass}>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label className="read-only-label" aria-label={`${fieldSchema.displayName}`}>{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label aria-label={value}>{value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		return (
			(fieldSchema.visibility === undefined || fieldSchema.visibility) &&
			<div style={customStyle} className={customClass}>
				<Form.Label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
				<Form.Group controlId={fieldSchema.id}>
					<div className={`${controlProps.error ? "error" : ""} ${fieldSchema.mode === "vertical" ? "freshui-radio-option" : "freshui-radio-horizontal"}`} aria-label={this.getCheckOptions(fieldSchema.options, controlProps)}>
						{this.getCheckOptions(fieldSchema.options, controlProps)}
					</div>
					{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					{controlProps.error && <Form.Text aria-label={controlProps.error}>{controlProps.error}</Form.Text>}
				</Form.Group>
			</div>
		);
	}
}

CheckBoxControl["displayName"] = "CheckBoxControl";

WidgetsFactory.instance.registerFactory(CheckBoxControl);
WidgetsFactory.instance.registerControls({
	checkbox_control: "CheckBoxControl",
	"itsy:form:checkbox": "CheckBoxControl"
});
