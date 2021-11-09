import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button } from 'react-bootstrap';
import { getlocaleText } from "../../utils/helper";

class ButtonControl extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties = (props) => {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(props.schema, definitions);
		return schema;
	}
	handleClick() {
		const { onButtonClick, fieldSchema } = this._getControlSchemaProperties(this.props);
		if (onButtonClick && typeof onButtonClick === "function") {
			onButtonClick();
		} else {
			fieldSchema.onButtonClick();
		}
	}

	render() {
		const { fieldSchema, displayName, style, className, iconPosition, iconName } = this._getControlSchemaProperties(this.props);
		const customClass = className ? className : "";
		const customStyle = style ? style : {};
		return (
			<div className={`freshui-btn-control ${customClass}`} style={customStyle}>
				{
					<Button variant="primary" size="sm" style={style} onClick={this.handleClick.bind(this)} >
						{iconPosition === "startIcon" && <i className="freshui-icons">{iconName}</i>}
						{displayName ? getlocaleText(displayName) : fieldSchema && fieldSchema.displayName}
						{this.props.children && this.props.children}
						{iconPosition === "endIcon" && <i className="freshui-icons">{iconName}</i>}
					</Button>
				}
			</div>
		);
	}
};
const mapDispatchToProps = (dispatch) => {
	return {};
};

const ButtonControlC = withReducer("ButtonControl", mapDispatchToProps)(ButtonControl);
ButtonControlC["displayName"] = 'Button';

WidgetsFactory.instance.registerFactory(ButtonControlC);
WidgetsFactory.instance.registerControls({
	button_control: 'Button',
	"itsy:ui:button": 'Button'
});