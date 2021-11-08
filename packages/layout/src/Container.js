import { SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import React, { Component } from "react";

class ItsyContainer extends Component {

	render() {
		const ItsyContainerSchema = {
			name: "Contianer_control",
			properties: {
				"ui:widget": "content_control",
				...this.props
			}
		};
		return <SchemaContainer schema={ItsyContainerSchema} />;
	}
}
ItsyContainer["displayName"] = "ItsyContainer";
WidgetsFactory.instance.registerFactory(ItsyContainer);
WidgetsFactory.instance.registerControls({
	itsy_contianer: "ItsyContainer",
	'itsy:container': "ItsyContainer"
});

export default ItsyContainer;