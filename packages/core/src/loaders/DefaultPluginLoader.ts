import WidgetsFactory from "../widgetsFactory";
import { PluginDefinition, IPluginLoader } from "@itsy-ui/core";
import { IAppSchemaProvider, DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class DefaultPluginLoader implements IPluginLoader {
	getPluginDefinition(widgetName: string): Promise<PluginDefinition | null> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const pluginsData = schemaProvider.getSchema("/plugins/data");
		return new Promise<PluginDefinition | null>((resolve, _) => {
			const pluginDefData = pluginsData.filter(t => t.widgets.indexOf(widgetName) > -1);
			if (pluginDefData.length > 0) {
				resolve(pluginDefData[0]);
			} else {
				resolve(null);
			}
		});
	}
}

WidgetsFactory.instance.registerService({
	PluginLoader: new DefaultPluginLoader(),
});
