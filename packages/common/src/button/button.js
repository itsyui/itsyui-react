import { SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import React, { Component } from "react";

class ItsyButton extends Component {
	onClick(e) {
		if (this.props.onClick) {
			this.props.onClick(e);
		}
	}
	render() {
		const { title, style, alignText, iconPosition, iconName, className, commandName, schema, onContext } = this.props
		const ItsyButtonSchema = {
			name: "itsy_button_ui",
			properties: {
				"ui:widget": "itsy_button_ui",
				title: title ? title : schema !== undefined && schema.title ? schema.title : "",
				style: style ? style : schema !== undefined && schema.style ? schema.style : {},
				alignText: alignText ? alignText : schema !== undefined && schema.alignText ? schema.alignText : "",
				iconPosition: iconPosition ? iconPosition : schema !== undefined && schema.iconPosition ? schema.iconPosition : undefined,
				iconName: iconName ? iconName : schema !== undefined && schema.iconName ? schema.iconName : undefined,
				className: className ? className : schema !== undefined && schema.className ? schema.className : undefined,
				commandName: commandName ? commandName : schema !== undefined && schema.commandName ? schema.commandName : undefined,
				...this.props,
				onClick: this.onClick.bind(this),
				onContext: onContext ? onContext : schema !== undefined ? schema.onContext : undefined,
			}
		};
		return <SchemaContainer schema={ItsyButtonSchema} />;
	}
}
ItsyButton["displayName"] = "ItsyButton";
WidgetsFactory.instance.registerFactory(ItsyButton);
WidgetsFactory.instance.registerControls({
	commandButton: "ItsyButton",
	"itsy:commandButton": "ItsyButton"
});

export default ItsyButton;