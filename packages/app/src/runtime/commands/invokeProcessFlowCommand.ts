import { WidgetsFactory } from "@itsy-ui/core";
import { CommandOptions } from "@itsy-ui/core";
import { getItemFromLocalStorage, isEmptyObject } from "@itsy-ui/utils";
import axios from "axios";
import { canExecuteCommand } from "../helpers/utils";
import { executeTransition, getContext } from "./commandUtils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const commandBindProvider = dataLoader.getLoader("commandBindProvider");
const configData = dataLoader.getLoader("config");

commandBindProvider.putSchema("invokeProcessFlow", (metadata) => {
	const commandObj: CommandOptions<any> = {
		canExecute: (data: any, _transition: (data: any) => void) => {
			return canExecuteCommand(data["config"]);
		},
		execute: async (data: any, transition: (data: any) => void) => {

			const record = getContext(data);
			const cfg = await configData.getConfig();
			if (cfg === null) {
				throw new Error("Config.json not available for API");
			}
			const PF_URL = cfg["PF_URL"];
			if (!PF_URL) {
				throw new Error("Connector configuration missing in the application");
			}

			const localFVData: any = getItemFromLocalStorage("FV_TENANT_INFO");
			if (metadata && !isEmptyObject(metadata)) {
				transition({
					type: "SHOW_INDICATOR",
					loadingMessage: "{{common.submitData}}",
				});
				try {
					const headers = {
						"Content-Type": "application/json",
						"x-cmis-repo-id": localFVData.repository[0],
						"x-cmis-tenantId": localFVData.tenantId,
						"authorization": metadata.useBearer ?
							`Bearer ${localFVData.token}` :
							`Basic ${btoa(`${localFVData.userAttributes["userId"]}:${localFVData.token}`)}`,
					};
					metadata.params = metadata.params && typeof metadata.params === "string" ? JSON.parse(metadata.params) : metadata.params;
					let inputMetaData = { "userId": localFVData.userAttributes.userId };
					inputMetaData = { ...inputMetaData, ...record, ...metadata.params }
					const body = {
						"deploymentId": metadata.processFlow,
						"variables": inputMetaData
					};
					const responseData = await axios.post(`${PF_URL}/pf/process-instances`, body, { headers });
					transition({
						type: "HIDE_INDICATOR",
					});
					if (metadata.onEndTransitions && metadata.onEndTransitions.length > 0) {
						const resData = getPfResponseData(responseData);
						for (let index = 0; index < metadata.onEndTransitions.length; index++) {
							const element = metadata.onEndTransitions[index];
							if (element.type) {
								executeTransition(element, inputMetaData, transition, resData);
							}
						}
					}
				} catch (er) {
					transition({
						type: "HIDE_INDICATOR",
					});
					const response = er && er.response && er.response.data ? er.response.data : er.message ? er.message : null;
					let errorMessage = response ? response.message || response.errorMessage : null;
					if (!errorMessage)
						errorMessage = "Error in network call";
					transition({
						type: "SHOW_NOTIFICATION",
						message: { "text": `${errorMessage}` },
						metadata: { "delay": 1500 },
						action: { "showCloseIcon": false },
					});
				}
			}
		},
	};
	return commandObj;
});

const getPfResponseData = (responseData) => {
	return responseData && responseData.hasOwnProperty("data") && responseData["data"].hasOwnProperty("data") ? responseData["data"]["data"] : {};
}
