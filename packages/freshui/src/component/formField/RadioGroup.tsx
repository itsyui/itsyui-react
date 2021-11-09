import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { getlocaleText } from "../../utils/helper";

class InputRadioGroup extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getRadioOptions = (options: any, controlProps) => {
		let result = [];
		if (options) {
			const { handleChange } = controlProps;
			result = options.map(t => {
				if (Object.prototype.toString.call(t) === "[object String]") {
					const selected = controlProps.value && controlProps.value === t ? true : false;
					return <Form.Check
						type="radio"
						name={controlProps.fieldSchema.id}
						id={`${controlProps.fieldSchema.id}-${t}`}
						key={t}
						checked={selected}
						value={t}
						label={t}
						onChange={e => handleChange && handleChange(e, t)}
					/>;
				} else {
					const selected = controlProps.value && controlProps.value === t.key ? true : false;
					// expecting as key value object pair
					return <Form.Check
						type="radio"
						name={controlProps.fieldSchema.id}
						id={`${controlProps.fieldSchema.id}-${t.key}`}
						key={t.key}
						value={t.key}
						label={t.value}
						checked={selected}
						onChange={e => handleChange && handleChange(e, t.key)}
					/>;
				}
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
			return (
				<Form.Group className={customClass} style={customStyle}>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label className="read-only-label">{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label>{controlProps.value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		return (
			(fieldSchema.visibility === undefined || fieldSchema.visibility) &&
			<div className={`radio-group-button ${customClass}`} style={customStyle}>
				<Form.Label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"}>{fieldSchema.displayName}</Form.Label>
				<Form.Group controlId={fieldSchema.id}>
					<div className={controlProps.fieldSchema.mode === "vertical" ? "freshui-radio-option" : "freshui-radio-horizontal"}>
						{this.getRadioOptions(fieldSchema.options, controlProps)}
					</div>
					{fieldSchema.helptext && <Form.Text>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					{controlProps.error && <Form.Text>{controlProps.error}</Form.Text>}
				</Form.Group>
			</div>
		);
	}
}

InputRadioGroup["displayName"] = "RadioGroupControl";

WidgetsFactory.instance.registerFactory(InputRadioGroup);
WidgetsFactory.instance.registerControls({
	radio_control: "RadioGroupControl",
	"itsy:form:radio": "RadioGroupControl"
});
