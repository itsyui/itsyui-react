let widgetsFactory = null;
export default class WidgetsFactory {
	_widgetMap = {};
	_widgets = {};
	_services = {};

	get widgetMap() {
		return this._widgetMap;
	}

	get widgets() {
		return this._widgets;
	}

	get services() {
		return this._services;
	}

	registerFactory(widgetFactory) {
		const widgetFactoryKey = widgetFactory.displayName ? widgetFactory.displayName : widgetFactory.name;
		this._widgets[widgetFactoryKey] = widgetFactory;
	}

	registerControls(controlsMap = {}) {
		this._widgetMap = { ...this._widgetMap, ...controlsMap };
	}

	registerService(service) {
		this._services = { ...this._services, ...service };
	}

	static get instance() {
		if (widgetsFactory == null) {
			widgetsFactory = new WidgetsFactory();
		}

		return widgetsFactory;
	}
}