import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class FormSchemaLoader implements ISchemaLoader {
	async getControlSchema(properties: any): Promise<any> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const { typeId, formSchemaId } = properties;
		const schemaId = formSchemaId !== undefined ? formSchemaId : "default";
		const formData = typeId ? await schemaProvider.getSchema(`/app/${typeId.replace(/:/g, "_")}/form/${schemaId}/data`) : null;
		return formData;
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	FormWidget: new FormSchemaLoader(),
});
