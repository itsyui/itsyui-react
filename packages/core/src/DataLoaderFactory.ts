import WidgetsFactory from "./widgetsFactory";

class DataLoaderFactory {
	_loaders = {};

	getLoader<K>(name: string): K {
		return this._loaders[name] as K;
	}

	/**
	 * Register a schema loader object that can be used anywhere with global access.
	 * @param loader JavaScript object that can be used from the global DataLoaderFactory
	 */
	registerLoader<T>(loader: { [x: string]: T }): void {
		this._loaders = { ...this._loaders, ...loader };
	}
}

WidgetsFactory.instance.registerService({
	"DataLoaderFactory": new DataLoaderFactory(),
});
