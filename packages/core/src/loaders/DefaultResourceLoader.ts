import WidgetsFactory from "../widgetsFactory";
import { IResourceLoader, DataLoaderFactory, ResourceDefinition, IAppSchemaProvider } from "@itsy-ui/core";

class DefaultResourceLoader implements IResourceLoader {
	async getResources(): Promise<ResourceDefinition[]> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const resourcesList = await schemaProvider.getSchema("/resources/data") as ResourceDefinition[];
		return resourcesList;
	}

	async loadResource(name: string, baseHref: string): Promise<boolean> {
		// const resourcesList = this._getResources();
		// const resourceData = resourcesList.filter(t => t.name === name);
		// if (resourceData.length > 0) {
		try {
			const appScriptURI = baseHref === undefined ? `/lib/${name}.js` : `/${baseHref}/lib/${name}.js`;
			// await import(appScriptURI);
			// await System.import(appScriptURI);
			return true;
		} catch (e) {
			//console.error("Error loading resource: ", e);
			//return false;
			throw e;
		}
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	resourceLoader: new DefaultResourceLoader(),
});
