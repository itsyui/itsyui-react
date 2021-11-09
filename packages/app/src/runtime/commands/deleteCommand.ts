import { WidgetsFactory } from "@itsy-ui/core";
import { CommandOptions } from "@itsy-ui/core";
import { canExecuteCommand } from "../helpers/utils";
import { isEmptyObject } from "@itsy-ui/utils";
import { executeTransition, getContext } from "./commandUtils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const commandBindProvider = dataLoader.getLoader("commandBindProvider");

async function deleteRecord(record, dataSource, controlID, transition, onEndTransitions) {
	try {
		transition({
			type: "SHOW_INDICATOR",
			loadingMessage: "{{common.loading}}",
		});
		const datasource = dataSource && typeof dataSource === "string" ? dataLoader.getLoader(dataSource) : dataSource && typeof dataSource === "object" ? dataSource : dataLoader.getLoader("datasource");
		let responseData;
		if (record.hasOwnProperty("cmis:objectId")) {
			responseData = await datasource.delete(record["cmis:objectId"]);
		} else {
			responseData = await datasource.delete(record);
		}
		transition({
			type: "HIDE_POPUP",
		});
		transition({
			type: "HIDE_INDICATOR",
		});
		transition({
			controlID,
			strict: true,
			type: "GRID_REFRESH",
		});
		if (onEndTransitions && onEndTransitions.length > 0) {
			for (let index = 0; index < onEndTransitions.length; index++) {
				const element = onEndTransitions[index];
				if (element.type) {
					executeTransition(element, record, transition, responseData);
				}
			}
		}
	} catch (er) {
		const errorMessage = er && er.response && er.response.data ? er.response.data.errorMessage && er.response.data.errorMessage : er.message ? er.message : "Error in delete Command";
		transition({
			type: "HIDE_INDICATOR",
		});
		console.error(errorMessage);
	}
}

commandBindProvider.putSchema("deleteCommand", (metadata) => {
	const commandObj: CommandOptions<any> = {
		canExecute: (data: any, _transition: (data: any) => void) => {
			return canExecuteCommand(data["config"]);
		},
		execute: async (data: any, transition: (data: any) => void) => {
			const { alertMessage, dataSource, onEndTransitions } = metadata;
			const { controlID } = data;
			const record = getContext(data);
			const popupData = {
				popupMessage: alertMessage,
				popupType: 2,
				onOk: async () => {
					await deleteRecord(record, dataSource, controlID, transition, onEndTransitions);
				},
				onCancel: {
					type: "HIDE_POPUP",
				},
			};
			if (record && !isEmptyObject(record)) {
				transition({
					type: "SHOW_POPUP",
					event: popupData,
				});
			}
		},
	};
	return commandObj;
});