import WidgetsFactory from "../widgetsFactory";
import { ILayoutType, DataLoaderFactory, ILayoutTypeRegister } from "@itsy-ui/core";

class DefaultLayoutRegistry implements ILayoutTypeRegister {
	_layoutSchema = {};

	registerComponentSchema(componentType: string, layoutType: ILayoutType) {
		this._layoutSchema = {
			...this._layoutSchema,
			[componentType]: layoutType,
		};
	}

	getComponentSchema(componentType: string): ILayoutType|null {
		if (componentType in this._layoutSchema) {
			return this._layoutSchema[componentType];
		} else {
			return null;
		}
	}

	getAllComponents(): ILayoutType[] {
		const t: ILayoutType[] = [];
		for (const k in this._layoutSchema) {
			t.push(this._layoutSchema[k]);
		}

		return t;
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	LayoutRegistry: new DefaultLayoutRegistry(),
});
