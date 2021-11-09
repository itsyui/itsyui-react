import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class SideBarSchemaLoader implements ISchemaLoader {
	async getControlSchema(_properties: any): Promise<any> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const sidebarData = await schemaProvider.getSchema("/app/sidebar/data");
		if (Object.keys(sidebarData).length > 0) {
			return sidebarData;
		} else {
			// tslint:disable-next-line: no-console
			console.error("No data found in schema folder ");
			return null;
		}
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	SidebarWidget: new SideBarSchemaLoader(),
});
