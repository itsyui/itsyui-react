import { SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import React, { Component } from "react";

class ItsyColumn extends Component {

	render() {
		const { span, padding, display, height, style, className } = this.props;

		const ItsyColumnSchema = {
			name: "col_control",
			properties: {
				"ui:widget": "col_control",
				span: span,
				padding: padding,
				display: display,
				height: height,
				style: style,
				className: className,
				...this.props
			}
		};
		return <SchemaContainer schema={ItsyColumnSchema} />;
	}
}
ItsyColumn["displayName"] = "ItsyColumn";
WidgetsFactory.instance.registerFactory(ItsyColumn);
WidgetsFactory.instance.registerControls({
	itsy_contianer: "ItsyColumn",
	'itsy:column': "ItsyColumn"
});

export default ItsyColumn;