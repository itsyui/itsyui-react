import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Form from 'react-bootstrap/Form';
import { getlocaleText, getFormLabelClassName } from "../../utils/helper";
import { Row, Col } from "react-bootstrap";
import Slider, { SliderTooltip, Range, Handle } from "rc-slider";
import 'rc-slider/assets/index.css';

class SlideType extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getMarks(options: any) {
		let marks;
		if (Array.isArray(options)) {
			marks = {};
			options.forEach(e => {
				marks[e.key] = e.value;
			});
		}
		return marks;
	}

	handle = props => {
		const { value, dragging, index, ...restProps } = props;
		return (
			<SliderTooltip
				prefixCls="rc-slider-tooltip"
				overlay={`${value}`}
				visible={dragging}
				placement="top"
				key={index}
			>
				<Handle value={value} {...restProps} />
			</SliderTooltip>
		);
	};

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema, isReadonly, value, handleChange, error } = controlProps;
		const { options, displayName, orientation, readOnly, min, max, helptext
			, defaultValue, step, showMarkStep, className, style } = fieldSchema;
		const marks = this.getMarks(options);
		const isVertical = !orientation || orientation === "horizontal" ? false : true;
		const customClassName = className ? className : "";
		const customeStyle = style ? style : {};
		if (isReadonly) {
			return (
				<Form.Group>
					<Row>
						<Col xs={6} sm={6} md={6} lg={6}>
							<Form.Label tabIndex={0} aria-label={`${displayName}:`}>{`${displayName}:`}</Form.Label>
						</Col>
						<Col xs={6} md={6} lg={6}>
							<Form.Label tabIndex={0} aria-label={value}>{value}</Form.Label>
						</Col>
					</Row>
				</Form.Group>
			);
		}
		return (
			<Form.Group controlId="formBasicRangeCustom" className={orientation === "vertical" ? `slider-height ${customClassName}` : `${customClassName}`} style={customeStyle} >
				<Form.Label id="discrete-slider" aria-label={displayName} className={getFormLabelClassName(fieldSchema)}>
					{displayName}
				</Form.Label>
				<Slider
					vertical={isVertical}
					marks={marks !== undefined && marks !== null ? marks : showMarkStep ? showMarkStep : undefined}
					disabled={readOnly !== undefined && readOnly !== null ? readOnly : false}
					onChange={(value) => handleChange && handleChange(undefined, value)}
					step={step !== undefined && step !== null && step !== "" ? step : !marks ? 1 : null}
					defaultValue={value !== undefined && value !== null ? value : defaultValue}
					className={error ? "error" : isVertical ? "slider-container slider-vertical" : "slider-container"}
					handle={this.handle}
					min={min}
					max={max}
				/>
				{helptext && <Form.Text tabIndex={0} aria-label={getlocaleText(helptext)}>{getlocaleText(helptext)}</Form.Text>}
				{error && <Form.Text tabIndex={0} aria-label={error} id="component-error-slider">{error}</Form.Text>}
			</Form.Group>
		);
	}
}

SlideType['displayName'] = 'SlideTypeControl';

WidgetsFactory.instance.registerFactory(SlideType);
WidgetsFactory.instance.registerControls({
	slider: 'SlideTypeControl',
	'itsy:form:slider': 'SlideTypeControl'
});