import { ICustomStateMachineData, ICustomStateMachineProvider } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";
import WidgetsFactory from '../widgetsFactory';
import { getValue, setValue } from "./utils";
// import { WidgetsFactory, ICustomStateMachineProvider, extend, ICustomStateMachineData } from "@itsy-ui/core";

class DefaultCustomStateMachineProvider implements ICustomStateMachineProvider {
	private jsonData: any = {};

	_getObjectPath(t: any): string {
		if (t === undefined) {
			return "";
		}

		const keys = Object.keys(t);
		if (keys.length > 0) {
			let keyPath = "";
			for (const k in keys) {
				const v = keys[k];
				const v0 = t[v] && t[v].replace(":", "_");
				keyPath += `/${v}___${v0}`;
			}
			return `${keyPath}/data`;
		} else {
			return "";
		}
	}

	getCustomStateMachine(widgetName: string, props: {}): any {
		const propertyPath = props !== undefined && props !== null ? `/${widgetName}` + this._getObjectPath(props) : `/${widgetName}`;
		const keyPath = propertyPath.split("/");
		return getValue(keyPath, this.jsonData);
	}

	registerCustomStateMachine(widgetName: string, props: {}, stateMachine: ICustomStateMachineData) {
		const keyPath = `/${widgetName}` + this._getObjectPath(props);
		const existingValue = this.getCustomStateMachine(widgetName, props);
		const checkIfAlreadyAdded = existingValue && existingValue.filter(t => t.name === stateMachine.name).length > 0;
		if (checkIfAlreadyAdded) {
			return;
		}

		let newValue = [stateMachine];
		if (existingValue !== null) {
			newValue = newValue.concat(existingValue);
		}

		setValue(keyPath, newValue, this.jsonData);
	}

	removeCustomStateMachine(widgetName: string, props: {}, stateMachine?: ICustomStateMachineData) {
		const keyPath = `/${widgetName}` + this._getObjectPath(props);
		let updatedStateMachineData = null;
		const existingValue = this.getCustomStateMachine(widgetName, props);
		if (existingValue !== null && existingValue.length > 1 && stateMachine !== undefined) {
			// if there are 2 states on the same KEY then we need to remove the state defined by the key
			updatedStateMachineData = existingValue.filter(t => t.name !== stateMachine.name);
		}

		setValue(keyPath, updatedStateMachineData, this.jsonData);
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	customStateProvider: new DefaultCustomStateMachineProvider(),
});
