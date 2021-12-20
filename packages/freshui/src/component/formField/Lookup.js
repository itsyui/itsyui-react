import { getDefaultRegistry, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Form } from 'react-bootstrap';
import { getlocaleText } from "../../utils/helper"
import { Row, Col } from "react-bootstrap";

class Lookup extends React.Component {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getLabel = (option, metadata) => {
		if (Array.isArray(metadata.displayKey) && option) {
			if (metadata.displayKey.length === 1 && option[metadata.displayKey[0]]) {
				return Array.isArray(option[metadata.displayKey[0]]) ? option[metadata.displayKey[0]].toString() : option[metadata.displayKey[0]];
			} else if (metadata.displayKey.length === 2 && option[metadata.displayKey[0]] && option[metadata.displayKey[1]]) {
				return `${option[metadata.displayKey[0]]}, ${option[metadata.displayKey[1]]}`;
			}
		}
		return option && metadata.displayKey && option[metadata.displayKey] ? option[metadata.displayKey] : "";
	}

	updateValue(controlProps, isMultiSelect, option, metadata) {
		let values;
		if (Array.isArray(option)) {
			values = option.map(t => t[metadata.valueKey]);
		} else {
			values = option ? option[metadata.valueKey] : "";
		}
		values = !isMultiSelect && Array.isArray(values) && values.length > 0 ? values[0] : values
		controlProps.handleChange && controlProps.handleChange(undefined, values)
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema, designerMetadata } = controlProps;
		const { metadata, lookupOptions } = fieldSchema;
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		const isMultiSelect = (metadata.isMulti === null || metadata.isMulti === undefined) ? false : metadata.isMulti;
		const placeHolder = fieldSchema.placeholderText ? fieldSchema.placeholderText : fieldSchema.placeholder ? fieldSchema.placeholder : "";
		let defaultValues;
		if (lookupOptions && lookupOptions.length > 0 && controlProps.value) {
			if (!isMultiSelect) {
				defaultValues = lookupOptions.filter((x) => x[metadata.valueKey] === controlProps.value);
			} else {
				if (Array.isArray(controlProps.value)) {
					defaultValues = [];
					lookupOptions.forEach(obj => {
						controlProps.value.forEach(function (val) {
							if (obj[metadata.valueKey] === val) {
								defaultValues.push(obj);
							}
						});
					});
				}
			}
		}
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
		return (<>
			{(fieldSchema.visibility === undefined || fieldSchema.visibility) &&
				<>
					<Form.Group className={customClass} style={customStyle} controlId={fieldSchema.id}>
						<Form.Label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"} tabIndex={0} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
						<div className="input-textbox">
							<Typeahead
								className="lookup-component"
								id={fieldSchema.id}
								options={lookupOptions}
								tabIndex={0} 
								aria-label={lookupOptions}
								multiple={isMultiSelect ? isMultiSelect : false}
								selected={defaultValues ? defaultValues : []}
								labelKey={(option) => { return !Array.isArray(option) ? this.getLabel(option, metadata) : controlProps.value }}
								onChange={(option) => {
									this.updateValue(controlProps, isMultiSelect, option, metadata)
								}}
								onSelect={(e, option) => {
									this.updateValue(controlProps, isMultiSelect, option, metadata)
								}}
								placeholder={placeHolder}
								renderMenuItemChildren={(option, props, index) =>
									this.getLabel(option, metadata)
								}
							/>
							{fieldSchema.helptext && <Form.Text className="helping-text" tabIndex={0} aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
							{controlProps.error &&
								<Form.Text id="component-error-text" tabIndex={0} aria-label={controlProps.error}>{controlProps.error}</Form.Text>
							}
						</div>
					</Form.Group>
				</>
			}
		</>
		);
	}
}

Lookup["displayName"] = "Lookup";

WidgetsFactory.instance.registerFactory(Lookup);
WidgetsFactory.instance.registerControls({
	lookup: "Lookup",
	"itsy:form:lookup": "Lookup"
});
