import { SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import React, { Component } from "react";

class ItsyRow extends Component {
	render() {
		const ItsyRowSchema = {
			name: "row_control",
			properties: {
				"ui:widget": "row_control",
				...this.props
			}
		};
		return <SchemaContainer key="row-control" schema={ItsyRowSchema} />;
	}
}
ItsyRow["displayName"] = "ItsyRow";
WidgetsFactory.instance.registerFactory(ItsyRow);
WidgetsFactory.instance.registerControls({
	Itsy_Row: "ItsyRow",
	'itsy:row': "ItsyRow"
});

export default ItsyRow;