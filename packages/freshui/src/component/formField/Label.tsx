import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { getlocaleText } from "../../utils/helper";
class LabelControl extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const { title, headerTag, headerSize, style, alignText, className } = this.getControlSchemaProperties();
		const CustomTag = headerTag ? headerTag : headerSize;
		const alignstyle = alignText !== undefined && alignText === "right" ? "flex-end" : alignText === "center" ? "center" : "flex-start";
		const customStyle = style ? { justifyContent: alignstyle, display: "flex", ...style } : { justifyContent: alignstyle, display: "flex" };
		const customClass = className ? `${className} label-root-contain` : "label-root-contain";
		if (CustomTag) {
			return (
				<div style={customStyle} className={customClass} tabIndex={0}>
					<CustomTag tabIndex={0} aria-label={getlocaleText(title)}>{getlocaleText(title)}</CustomTag>
				</div>
			);
		} else {
			return (
				<label style={customStyle} className={customClass} tabIndex={0} aria-label={getlocaleText(title)}>
					{getlocaleText(title)}
				</label>
			);
		}
	}
}

LabelControl["displayName"] = "LabelControl";

WidgetsFactory.instance.registerFactory(LabelControl);
WidgetsFactory.instance.registerControls({
	label_control: "LabelControl",
	"itsy:form:label": "LabelControl"
});
