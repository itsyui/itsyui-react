import WidgetsFactory from "../widgetsFactory";
import { DataLoaderFactory, IPageBindProvider } from "@itsy-ui/core";
import { getValue, setValue } from "./utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class PageBindProvider implements IPageBindProvider {
	private jsonData: any = {};

	getSchema(key: string, feature: string): any {
		const keyPath = `${key}/${feature}`.split("/");
		return getValue(keyPath, this.jsonData);
	}

	putSchema(key: string, feature: string, data: any) {
		const propertyPath = `${key}/${feature}`;
		setValue(propertyPath, data, this.jsonData);
	}

}

dataLoader.registerLoader({
	pageBindProvider: new PageBindProvider(),
});
