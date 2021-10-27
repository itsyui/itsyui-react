import WidgetsFactory from "../widgetsFactory";
import { IAppSchemaProvider, DataLoaderFactory } from "@itsy-ui/core";
import { getValue, setValue } from "./utils";

class LocalAppSchemaProvider implements IAppSchemaProvider {
	private jsonData: any = {};
	private anotherLoader: any = null;

	async getSchema(propertyPath: string): Promise<any> {
		// ex: Key can be of path format
		// /form/order/order.json
		const keyPath = propertyPath.split("/");
		const data = getValue(keyPath, this.jsonData);
		if (data) {
			return data;
		}
		if (this.anotherLoader && data === null) {
			const dbData = await this.anotherLoader.getSchema(propertyPath);
			if (dbData !== undefined && dbData !== null) {
				this.putSchema(propertyPath, dbData);
				return dbData;
			}
		}
		return null;
	}

	putSchema(propertyPath: string, data: any) {
		setValue(propertyPath, data, this.jsonData);
	}

	async appendSchema(propertyPath: string, data: any) {
		const obj = await this.getSchema(propertyPath);
		if (obj !== null) {
			const combinedJson = { ...obj, ...data };
			await this.putSchema(propertyPath, combinedJson);
		} else {
			await this.putSchema(propertyPath, data);
		}
	}

	getSchemaSync(propertyPath: string) {
		const keyPath = propertyPath.split("/");
		const data = getValue(keyPath, this.jsonData);
		if (data) {
			return data;
		}
		return null;
	}

	appendSchemaSync(propertyPath: string, data: any) {
		const obj =  this.getSchemaSync(propertyPath);
		if (obj !== null) {
			const combinedJson = { ...obj, ...data };
			this.putSchema(propertyPath, combinedJson);
		} else {
			this.putSchema(propertyPath, data);
		}
	}

	public setAnotherLoader(loader: any) {
		this.anotherLoader = loader;
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	appSchemaProvider: new LocalAppSchemaProvider(),
});
