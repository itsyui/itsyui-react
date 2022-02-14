import DateFnsUtils from '@date-io/date-fns';
import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import { getlocaleText, getFormLabelClassName } from "../../utils/helper";
import { Row, Col } from "react-bootstrap";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

class InputDate extends React.Component<IWidgetControlProps, {}>  {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleDateChange(event) {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		let value = event.target.value ? event.target.value : controlProps.value;
		if (fieldSchema.enableDate || fieldSchema.enableDate === undefined) {
			value = fieldSchema.outputFormat && fieldSchema.outputFormat === "string" ? this.getISODateTime(value, true) : Date.parse(value);
		}
		controlProps.handleChange(undefined, value);
	}

	renderDate(controlProps, fieldSchema, className, style) {
		const { minDate, maxDate } = this.getMinMaxDate();
		const disabledClass = fieldSchema.readOnly ? "borderDisable" : ""
		return (
			<Form.Group className={`date-time-contianer ${className}`} style={style} controlId={fieldSchema.id}>
				<label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</label>
				<div className="date-component">
					<Form.Control
						type="date"
						className={`date-time-control date-time-border ${disabledClass}`}
						min={fieldSchema.minDate}
						max={fieldSchema.maxDate}
						disabled={fieldSchema.readOnly}
						tabIndex={0} 
						aria-label={this.getISODate(controlProps.value)}
						value={this.getISODate(controlProps.value)}
						onChange={this.handleDateChange && this.handleDateChange.bind(this)}
					/>
					{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					{controlProps.error && <Form.Text aria-label={controlProps.error}>{controlProps.error}</Form.Text>}
				</div>
			</Form.Group>
		);
	}

	renderDateTime(controlProps, fieldSchema, className, style) {
		return (
			<Form.Group className={`date-time-contianer ${className}`} style={style} controlId={fieldSchema.id}>
				<label className="text-label" aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</label>
				<div className="date-component">
					<Form.Control
						type="datetime-local"
						className="date-time-control date-time-border MuiOutlinedInput-root"
						min={this.getISODateTime(fieldSchema.minDate)}
						max={this.getISODateTime(fieldSchema.maxDate)}
						tabIndex={0} 
						aria-label={this.getISODateTime(controlProps.value)}
						value={this.getISODateTime(controlProps.value)}
						onChange={this.handleDateChange && this.handleDateChange.bind(this)}
					/>
					{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					{controlProps.error && <Form.Text aria-label={controlProps.error}>{controlProps.error}</Form.Text>}
				</div>
			</Form.Group>
		);
	}
	renderTime(controlProps, fieldSchema, className, style) {
		return (
			<Form.Group className={`date-time-contianer ${className}`} style={style} controlId={fieldSchema.id}>
				<label className="text-label" aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</label>
				<div className="date-component">
					<Form.Control
						type="time"
						className="date-time-control date-time-border"
						tabIndex={0} 
						aria-label={controlProps.value}
						value={controlProps.value}
						onChange={this.handleDateChange && this.handleDateChange.bind(this)}
					/>
					{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					{controlProps.error && <Form.Text aria-label={controlProps.error}>{controlProps.error}</Form.Text>}
				</div>
			</Form.Group>
		);
	}
	pad(x) {
		return x < 10 ? `0${x}` : x;
	}
	padYear(y) {
		return y.toLocaleString('en-US', {
			minimumIntegerDigits: 4,
			useGrouping: false
		})
	}
	//yyyy-MM-ddThh:mm format
	getISODateTime(value, includeMS = false) {
		const date = new Date(value);
		if (date.toString() !== "Invalid Date") {
			let isoDateString = date.getFullYear() +
				'-' + this.pad(date.getMonth() + 1) +
				'-' + this.pad(date.getDate()) +
				'T' + this.pad(date.getHours()) +
				':' + this.pad(date.getMinutes()) +
				':' + this.pad(date.getSeconds());
			if (includeMS) {
				isoDateString = isoDateString + '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
					'Z';
			}
			return isoDateString;
		}
		return new Date().toISOString();
	}
	getISODate(value) {
		const date = new Date(value);
		if (date.toString() !== "Invalid Date") {
			return this.padYear(date.getFullYear()) +
				'-' + this.pad(date.getMonth() + 1) +
				'-' + this.pad(date.getDate());
		}
		return new Date().toISOString();
	}
	handleRangeDate = (event, picker) => {
		const DateRanger = {
			startDate: picker.startDate,
			endDate: picker.endDate,
		}
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		controlProps.handleChange(undefined, DateRanger);
	}
	handleRangeCallback = (start, end) => {
		const DateRanger = {
			startDate: start,
			endDate: end,
		}
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;
		controlProps.handleChange(undefined, DateRanger);
	}

	renderDateRange = (controlProps, fieldSchema, className, style) => {
		const { minDate, maxDate } = this.getMinMaxDate();
		return <>{
			fieldSchema.readOnly ? <div className={className} style={style}><label className={fieldSchema.readOnly ? "text-label label-disabled" : "text-label"} tabIndex={0} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</label>
				<Form.Control
					id={fieldSchema.id}
					key={fieldSchema.id}
					tabIndex={0} 
					aria-label={controlProps.value ? controlProps.value : " "}
					value={controlProps.value ? controlProps.value : " "}
					disabled={fieldSchema.readOnly}
				/></div>
				: <Form.Group className="date-time-contianer date-range" controlId={fieldSchema.id}>
					<Form.Label className={getFormLabelClassName(fieldSchema)} aria-label={fieldSchema.displayName}>{fieldSchema.displayName}</Form.Label>
					<div className="date-component">
						<DateRangePicker
							key={fieldSchema.id}
							initialSettings={{
								locale: {
									format: fieldSchema.dateFormat ? fieldSchema.dateFormat.toUpperCase() : "MM/DD/YYYY",
								},
								minDate: fieldSchema.minDate && typeof fieldSchema.minDate === "string" ? minDate : fieldSchema.minDate,
								maxDate: fieldSchema.maxDate && typeof fieldSchema.maxDate === "string" ? maxDate : fieldSchema.maxDate,
								startDate: controlProps.value && controlProps.value.startDate && this.getISODate(controlProps.value.startDate),
								endDate: controlProps.value && controlProps.value.endDate && this.getISODate(controlProps.value.endDate),
							}}
							onApply={this.handleRangeDate.bind(this)}
							onCallback={this.handleRangeCallback.bind(this)}
						>
							<Form.Control type="text" className="form-control" />
						</DateRangePicker>
						{fieldSchema.helptext && <Form.Text aria-label={getlocaleText(fieldSchema.helptext)}>{getlocaleText(fieldSchema.helptext)}</Form.Text>}
					</div>
				</Form.Group>
		}
		</>;

	}

	generateDate = (userDate, operation) => {
		const controlProps = this.getControlSchemaProperties();
		const { customMinDate, customMaxDate, dateSpan } = controlProps.fieldSchema;
		let currentDate = new Date();
		const checkValidDate = new Date(userDate);
		if (checkValidDate.toString() === "Invalid Date") {
			switch (userDate) {
				case "tomorrow":
					currentDate.setDate(currentDate.getDate() + 1);
					break;
				case "yesterday":
					currentDate.setDate(currentDate.getDate() - 1);
					break;
				case "custom": //both max & min have custom date
					if (operation === "MIN") {
						currentDate = new Date(customMinDate);
					} else {
						currentDate = new Date(customMaxDate);
					}
					break;
				case "dateSpan":
					currentDate.setDate(currentDate.getDate() + dateSpan);
					break;
				default:
					break;
			}
		} else {
			return this.getISODate(userDate);
		}
		return currentDate;
	}

	getMinMaxDate = () => {
		const controlProps = this.getControlSchemaProperties();
		const { minDate, maxDate } = controlProps.fieldSchema;
		const generatedMinDate = this.generateDate(minDate, "MIN");
		const generatedMaxDate = this.generateDate(maxDate, "MAX");
		return { minDate: generatedMinDate, maxDate: generatedMaxDate };
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
							<Form.Label className="read-only-label" tabIndex={0} aria-label={`${fieldSchema.displayName}:`}>{`${fieldSchema.displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							{controlProps.value && <Form.Label tabIndex={0} aria-label={this.getISODate(controlProps.value)}>{this.getISODate(controlProps.value)}</Form.Label>}
						</Col>
					</Row>
				</Form.Group>
			);
		}
		if (fieldSchema.visibility === undefined || fieldSchema.visibility) {
			if (fieldSchema.dateRange) {
				return this.renderDateRange(controlProps, fieldSchema, customClass, customStyle);
			}
			if (fieldSchema.enableDate && fieldSchema.enableTime) {
				return this.renderDateTime(controlProps, fieldSchema, customClass, customStyle);
			} else if (fieldSchema.enableDate) {
				return this.renderDate(controlProps, fieldSchema, customClass, customStyle);
			} else if (fieldSchema.enableTime) {
				return this.renderTime(controlProps, fieldSchema, customClass, customStyle);
			} else {
				return this.renderDate(controlProps, fieldSchema, customClass, customStyle);
			}
		} else { return null; }
	}
}

InputDate['displayName'] = 'InputDateControl';

WidgetsFactory.instance.registerFactory(InputDate);
WidgetsFactory.instance.registerControls({
	date: 'InputDateControl',
	datetime: 'InputDateControl',
	"itsy:form:date": 'InputDateControl'
});