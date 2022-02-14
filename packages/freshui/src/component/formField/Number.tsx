import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { getlocaleText, getFormLabelClassName } from "../../utils/helper";
import { Row, Col } from "react-bootstrap";

class MuiInputNumber extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getFormattedMaskPattern(value) {
		const regexArray = [];
		if (value) {
			for (let i = 0; i < value.length; i++) {
				let regex = value.charAt(i);
				if (regex === '#') {
					regexArray.push(/[0-9]/);
				}
				else { regexArray.push(regex); }
			}
		}
		return regexArray;
	}

	getCurrentValue(event) {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const numberValue = fieldSchema.allowDecimal === true ? event.target.value.replace(/[^\d.-]/g, '') : event.target.value.replace(/[^\d]/g, '');
		return fieldSchema.allowDecimal === true ? parseFloat(numberValue) : parseInt(numberValue);
	}

	renderField(userMask) {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		const disabledClass = fieldSchema.readOnly ? "borderDisable" : "";
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
		if (fieldSchema.useMask) {
			return <>
				<Form.Group className={customClass} style={customStyle}>
					<Form.Label className={getFormLabelClassName(fieldSchema)} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
					<div className="input-textbox">
						<MaskedInput
							mask={userMask ? userMask : []}
							className={`form-control form-control ${disabledClass}`}
							id={fieldSchema.id}
							key={fieldSchema.id}
							disabled={fieldSchema.readOnly}
							guide={fieldSchema.guide !== undefined ? fieldSchema.guide : false}
							showMask={fieldSchema.showMask !== undefined ? fieldSchema.showMask : false}
							placeholder={placeHolder}
							field={fieldSchema.id}
							tabIndex={0} 
							aria-label={(controlProps.value !== undefined && controlProps.value !== null && controlProps.value !== "")
							? controlProps.value : ""}
							variant={fieldSchema.variant ? fieldSchema.variant : "outlined"}
							value={(controlProps.value !== undefined && controlProps.value !== null && controlProps.value !== "")
								? controlProps.value : ""}
							readOnly={fieldSchema.isReadonly}
							required={fieldSchema.required}
							onChange={(e) => {
								const value = this.getCurrentValue(e);
								controlProps.handleChange && controlProps.handleChange(e, isNaN(value) ? "" : value);
							}}
							onBlur={(e) => {
								const value = this.getCurrentValue(e);
								value && controlProps.handleBlur && controlProps.handleBlur(e, isNaN(value) ? "" : value);
							}}
						/>
						{fieldSchema.helptext && <Form.Text className="helping-text" aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
						{controlProps.error &&
							<Form.Text id="component-error-text" aria-label={controlProps.error}>{controlProps.error}</Form.Text>
						}
					</div>
				</Form.Group>
			</>;
		}
		return <>
			<Form.Group className={customClass} style={customStyle} controlId={fieldSchema.id}>
				<Form.Label className={getFormLabelClassName(fieldSchema)} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
				<div className="input-textbox">
					<Form.Control
						type="number"
						disabled={fieldSchema.readOnly}
						placeholder={fieldSchema.placeholder}
						tabIndex={0} 
						aria-label={controlProps.value !== undefined ? controlProps.value : ""}
						value={controlProps.value !== undefined ? controlProps.value : ""}
						className={controlProps.error ? 'form-control error' : 'form-control'}
						onBlur={(v) => {
							controlProps.handleBlur &&
								controlProps.handleBlur(v, parseFloat(v.target.value));
						}}
						onChange={e => controlProps.handleChange && controlProps.handleChange(e, parseFloat(e.target.value))}
					></Form.Control>
				</div>
				{controlProps.error &&
					<Form.Text id="component-error-text" aria-label={controlProps.error}>{controlProps.error}</Form.Text>
				}
			</Form.Group>
		</>;

	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		let userMask;
		if (fieldSchema.useMask) {
			switch (fieldSchema.maskType) {
				case "text":
					userMask = this.getFormattedMaskPattern(fieldSchema.maskValue);
					break;
				case "number":
					userMask = createNumberMask({
						prefix: fieldSchema.prefix ? fieldSchema.prefix : "",
						suffix: fieldSchema.suffix ? fieldSchema.suffix : "",
						includeThousandsSeparator: fieldSchema.includeThousandsSeparator ? fieldSchema.includeThousandsSeparator : false,
						integerLimit: fieldSchema.integerLimit ? fieldSchema.integerLimit : null,
						allowDecimal: fieldSchema.allowDecimal ? fieldSchema.allowDecimal : "",
						decimalLimit: fieldSchema.decimalLimit ? fieldSchema.decimalLimit : null,
						decimalSymbol: fieldSchema.decimalSymbol ? fieldSchema.decimalSymbol : '.',

					});
					break;
			}
		}

		return (
			<div>
				{this.renderField(userMask)}
			</div>
		);
	}
}

MuiInputNumber["displayName"] = "MuiInputNumber";

WidgetsFactory.instance.registerFactory(MuiInputNumber);
WidgetsFactory.instance.registerControls({
	number: "MuiInputNumber",
	integer: "MuiInputNumber",
	"itsy:form:number": "MuiInputNumber"
});
