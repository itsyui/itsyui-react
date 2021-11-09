import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class NavbarSchemaLoader implements ISchemaLoader {
	async getControlSchema(_properties: any): Promise<any> {
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const navbarData = await schemaProvider.getSchema("/app/navbar/data");
		if (navbarData && Object.keys(navbarData).length > 0) {
			return navbarData;
		} else {
			return null;
		}
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	"NavbarWidget_Schema": new NavbarSchemaLoader(),
});
