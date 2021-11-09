import WidgetsFactory from "../widgetsFactory";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
import { getValue, setValue } from "./utils";

class CommandBindProvider {
	private jsonData: any = {};

	getSchema(key: string): any {
		const keyPath = `/app/commands/${key}`.split("/");
		return getValue(keyPath, this.jsonData);
	}

	putSchema(key: string, data: any) {
		const propertyPath = `/app/commands/${key}`;
		setValue(propertyPath, data, this.jsonData);
	}
}

dataLoader.registerLoader({
	commandBindProvider: new CommandBindProvider(),
});
