import { WidgetsFactory } from "@itsy-ui/core";
import { CommandOptions, DataLoaderFactory, ICommandManager, IAuthService } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");

const logoutCommand: CommandOptions<any> = {
	canExecute: (_data: any) => {
		return true;
	},
	execute: async (_data: any, transition: any) => {
		const authService = dataLoader.getLoader<IAuthService>("auth");
		dataLoader.registerLoader({
			"datasource": null
		});
		transition({
			type: "NAVIGATE_URL",
			url: "/login",
		});
		authService.logout();
		window.location.reload();
	},
};
commandManager.registerCommand("logout", {}, logoutCommand);