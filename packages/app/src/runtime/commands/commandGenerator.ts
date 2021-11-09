import { WidgetsFactory } from "@itsy-ui/core";
import "./deleteCommand";
import "./drawerCommand";
import "./invokeProcessFlowCommand";
import "./modalCommand";
import "./navigateCommand";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const commandManager = dataLoader.getLoader("commandManager");
const commandBindProvider = dataLoader.getLoader("commandBindProvider");

dataLoader.registerLoader({
	"commandLoader": {
		generateCommand: (commandsData: []) => {
			for (let index = 0; index < commandsData.length; index++) {
				const command = commandsData[index];
				const metadata = command["commandConfig"];
				const commandObj = commandBindProvider.getSchema(metadata["commandOperation"]);
				if (commandObj) {
					commandManager.registerCommand(command["commandKey"], {}, commandObj(metadata));
				}
			}
		}
	},
});
