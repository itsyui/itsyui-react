import WidgetsFactory from "../widgetsFactory";
import { DataLoaderFactory, IAppSchemaProvider } from "@itsy-ui/core";

class DefaultAppSchemaLoader {
	async load(baseHref: string) {
		const appScriptURI = baseHref === undefined ? "/lib/app-schema.js" : `/${baseHref}/lib/app-schema.js`;
		await import(appScriptURI);
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	appSchemaLoader: new DefaultAppSchemaLoader(),
});
