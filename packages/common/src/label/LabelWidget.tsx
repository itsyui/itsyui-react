import { SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { doLabelBeforeRefresh, doLabelRefresh } from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

class LabelWidget extends React.Component<any> {

	_getLabelUIControlSchema() {
		const { title, headerTag, headerSize, style, alignText, className } = this.props.schema;
		const labelUIControlSchema = {
			name: `label-ui-control`,
			properties: {
				"ui:widget": "label_control",
				title: this.props.title !== undefined && this.props.title !== "" ? this.props.title : title,
				headerSize,
				headerTag,
				style,
				alignText,
				className
			},
		};
		return <SchemaContainer schema={labelUIControlSchema} />;
	}

	render() {
		return (
			this._getLabelUIControlSchema()
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onLabelBeforeRefresh: (event) => dispatch(doLabelBeforeRefresh(event)),
		onLabelRefresh: (event) => dispatch(doLabelRefresh(event)),
	};
};

const ItsyLabel = withReducer("LabelWidget", reducer, mapDispatchToProps, stateJSON)(LabelWidget);
ItsyLabel.displayName = "LabelWidget";

WidgetsFactory.instance.registerFactory(ItsyLabel);
WidgetsFactory.instance.registerControls({
	label: "LabelWidget",
	'itsy:label': 'LabelWidget'
});

export default ItsyLabel;