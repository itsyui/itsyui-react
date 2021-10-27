import React from "react";
import UnsupportedField from './UnsupportedField';
import {
	retrieveSchema,
	getDefaultRegistry,
	getUiOptions
} from "./utils";
import getWidget from './getWidget';
import WidgetFactory from './widgetsFactory';

class SchemaContainer extends React.Component {
	static defaultProps = {
		uiSchema: {},
	};

	getRegistry() {
		const { widgets } = getDefaultRegistry();
		return {
			widgets: { ...widgets, ...this.props.widgets },
			definitions: this.props.schema.definitions || {},
			componentTypes: { ...this.props.componentTypes },
		};
	}

	// TODO: optimize this for schema props
	// shouldComponentUpdate(nextProps, nextState) {
	// 	return shouldRender(this, nextProps);
	// }

	render() {
		const registry = this.getRegistry();
		const { definitions } = registry;
		const { widgetMap } = WidgetFactory.instance;
		const schema = retrieveSchema(this.props.schema, definitions);
		if (Object.keys(schema).length === 0) {
			// See #312: Ensure compatibility with old versions of React.
			return <div />;
		}

		if (!schema.hasOwnProperty("properties")) {
			return (
				<UnsupportedField
					schema={schema}
					reason="properties"
				/>
			);
		}

		const { properties } = schema;
		if (!properties.hasOwnProperty("ui:widget")) {
			return (
				<UnsupportedField
					schema={schema}
					reason="ui:widget should be defined for control type"
				/>
			);
		}

		const { uiSchema } = this.props;
		const widgetType = properties['ui:widget'];
		const { widget = widgetType, ...options } = getUiOptions(
			uiSchema
		);
		const { widgets } = registry;
		if (widgets && !widgets.hasOwnProperty(widget) && widgetMap && !widgetMap.hasOwnProperty(widget)) {
			return (
				<UnsupportedField
					schema={schema}
					reason={`Unsupported widget <b>${widget}</b>. Please register the widget before using it. `}
				/>
			);
		}
		const Widget = getWidget(widget, widgets);
		return (
			<Widget
				key={schema.name}
				options={options}
				schema={schema.properties}
				uiSchema={uiSchema}
				registry={registry}
				className={this.props.className}
				style={this.props.style}>
				{this.props.children}
			</Widget>
		);
	}
}

SchemaContainer.defaultProps = {
	uiSchema: {},
	errorSchema: {},
	registry: {},
	regionName: ''
};

export default SchemaContainer;