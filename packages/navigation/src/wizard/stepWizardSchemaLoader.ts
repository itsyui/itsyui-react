import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class StepWizardSchemaLoader implements ISchemaLoader {
	async getControlSchema(properties: any): Promise<any> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const { typeId } = properties;
		const schemaId = properties.schemaId !== undefined ? properties.schemaId : "default";
		try {
			const stepwizardData = await schemaProvider.getSchema(`/app/${typeId.replace(/:/g, "_")}/stepwizard/${schemaId}/data`);
			return stepwizardData;
		} catch (e) {
			// console.log(e);
		}
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	wizard: new StepWizardSchemaLoader(),
});
