import WidgetsFactory from "../widgetsFactory";
import { IConfigLoader, DataLoaderFactory, IConfigData, IAppSchemaProvider } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class DefaultConfigLoader implements IConfigLoader {
	getConfig(): Promise<IConfigData> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const configData = schemaProvider.getSchema("/config/data");
		return Promise.resolve(configData);
	}
}

dataLoader.registerLoader({
	config: new DefaultConfigLoader(),
});
