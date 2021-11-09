import { DataLoaderFactory, ISchemaLoader, IAppSchemaProvider } from "@itsy-ui/core";
import { WidgetsFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class AppBarSchemaLoader implements ISchemaLoader {
	getControlSchema(_properties: any): Promise<any> {
		return new Promise<any>((resolve, _reject) => {
			const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
			const navbarData = schemaProvider.getSchema("/app/navbar/data");
			if (Object.keys(navbarData).length > 0) {
				resolve(navbarData);
			} else {
				resolve([]);
			}
		});
	}
}

const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
schemaLoaderFactory.registerLoader({
	"AppBarWidget_Schema": new AppBarSchemaLoader(),
});
