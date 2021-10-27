import React from 'react';
import WidgetFactory from './widgetsFactory';

export default function getWidget(widget, registeredWidgets = {}) {
	const { widgetMap } = WidgetFactory.instance;

	function mergeOptions(Widget) {
		// cache return value as property of widget for proper react reconciliation
		if (!Widget.MergedWidget) {
			const defaultOptions =
				(Widget.defaultProps && Widget.defaultProps.options) || {};
			Widget.MergedWidget = ({ options = {}, ...props }) => (
				<Widget options={{ ...defaultOptions, ...options }} {...props} />
			);
		}
		return Widget.MergedWidget;
	}

	if (typeof widget === 'function') {
		return mergeOptions(widget);
	}

	if (typeof widget !== 'string') {
		throw new Error(`Unsupported widget definition: ${typeof widget}`);
	}

	if (registeredWidgets.hasOwnProperty(widget)) {
		const registeredWidget = registeredWidgets[widget];
		return getWidget(registeredWidget, registeredWidgets);
	}

	if (widgetMap.hasOwnProperty(widget)) {
		const registeredWidget = registeredWidgets[widgetMap[widget]];
		return getWidget(registeredWidget, registeredWidgets);
	} else {
		throw new Error(`Unsupported widget definition defined: ${widget}; please register the widget before consuming.`);
	}
}
