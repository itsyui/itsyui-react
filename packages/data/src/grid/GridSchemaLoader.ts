import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class GridSchemaLoader implements ISchemaLoader {
	async getControlSchema(properties: any): Promise<any> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const { typeId, gridSchemaId } = properties;
		const schemaId = gridSchemaId ? gridSchemaId : "default";
		const data = typeId ? await schemaProvider.getSchema(`/app/${typeId.replace(/:/g, "_")}/grid/${schemaId}/data`) : null;
		if (data !== null && Object.keys(data).length > 0) {
			return data;
		} else {
			return null; // throw (new Error("No data found in schema folder " + typeId));
		}
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	GridWidget: new GridSchemaLoader(),
});
