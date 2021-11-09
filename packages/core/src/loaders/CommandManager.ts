import WidgetsFactory from "../widgetsFactory";
import { DataLoaderFactory, ICommandManager, ICommand, CommandFunction, CommandOptions } from "@itsy-ui/core";
import { getValue, setValue } from "./utils";

class CommandManager implements ICommandManager {
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
				const v0 = t[v].replace(":", "_");
				keyPath += `/${v}___${v0}`;
			}
			return keyPath;
		} else {
			return "";
		}
	}

	getCommand<TData>(commandName: string, context: {}): ICommand<TData> {
		const propertyPath = `/${commandName}` + this._getObjectPath(context);
		const keyPath = propertyPath.split("/");
		return getValue(keyPath, this.jsonData);
	}

	_normaliseOptions<TData>(optionsOrFunc: CommandFunction<TData> | CommandOptions<TData>) {
		const options = <CommandOptions<TData>> {};
		options.execute = (<CommandOptions<TData>> optionsOrFunc).execute
			|| <CommandFunction<TData>> optionsOrFunc;

		options.canExecute = (<CommandOptions<TData>> optionsOrFunc).canExecute
			|| function() { return true; };

		return options;
	}

	createCommand<TData>(optionsOrFunc: CommandFunction<TData> | CommandOptions<TData>) {
		const options = this._normaliseOptions(optionsOrFunc);
		const command = <ICommand<TData>> function() {
			// tslint:disable-next-line:no-invalid-this
			return options.execute.apply(this, arguments);
		};

		command.execute = function() {
			// tslint:disable-next-line:no-invalid-this
			const resultOrResultPromise = options.execute.apply(this, arguments);
			return resultOrResultPromise;
		};

		command.canExecute = function() {
			// tslint:disable-next-line:no-invalid-this
			return options.canExecute ? options.canExecute.apply(this, arguments) : true;
		};

		// if (options.canExecute) {
		// 	options.canExecute.apply(this, arguments)
		// 		.then(r => canExecutePromiseResolve(r))
		// 		.catch(e => canExecutePromiseReject(e));
		// }

		return command;
	}

	registerCommand<TData>(commandName: string, context: {}, options: CommandFunction<TData> | CommandOptions<TData>): void {
		const keyPath = `/${commandName}` + this._getObjectPath(context);
		const command = this.createCommand(options);
		setValue(keyPath, command, this.jsonData);
	}
}

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
dataLoader.registerLoader({
	commandManager: new CommandManager(),
});
