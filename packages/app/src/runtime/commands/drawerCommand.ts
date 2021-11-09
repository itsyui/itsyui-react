import { WidgetsFactory } from "@itsy-ui/core";
import { CommandOptions } from "@itsy-ui/core";
import { getUrlParams } from "@itsy-ui/utils";
import { canExecuteCommand } from "../helpers/utils";
import { getContext, getCustomWidgetContextPath, getCustomWidgetControlId, getFormContext, getRuntimeQueryParams } from "./commandUtils";

const Actions = {
	DRAWER: "drawer",
	WIDGETTYPE: {
		FORM: "form",
		CUSTOM: "custom",
	},
	STATE: {
		SHOW_DRAWER: "SHOW_DRAWER",
		HIDE_DRAWER: "HIDE_DRAWER",
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
	},
};

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const commandBindProvider = dataLoader.getLoader("commandBindProvider");

// drawer
commandBindProvider.putSchema("drawer", (metadata) => {
	const commandObj: CommandOptions<any> = {
		canExecute: (data: any, _transition: (data: any) => void) => {
			return canExecuteCommand(data["config"]);
		},
		execute: async (data: any, transition: (data: any) => void) => {
			const { controlSchema } = metadata;
			const record = controlSchema.properties["ui:widget"] === Actions.WIDGETTYPE.FORM || controlSchema.properties["ui:widget"] === "itsy:form" ? getFormContext(data) : getContext(data);
			const drawerData: any = {};
			drawerData["title"] = metadata.title;
			drawerData["width"] = metadata.width !== undefined ? metadata.width : 520;
			drawerData["isToggleSize"] = metadata.isToggleSize ?? false;
			const controlID = getCustomWidgetControlId(controlSchema);
			let queryParams = getUrlParams(window.location.search);
			const commandQueryParams = data.queryParams ? data.queryParams : {};
			const rootPageContext: any = data.pageContext;
			queryParams = controlSchema.properties["ui:widget"] === "r" || controlSchema.properties["ui:widget"] === "itsy:page" ?
				{ ...getRuntimeQueryParams(controlSchema.properties["pageQueryParams"], { ...queryParams, ...commandQueryParams }, record) } :
				{ ...rootPageContext && rootPageContext.queryParams && rootPageContext.queryParams, ...commandQueryParams };
			drawerData.controlSchema = {
				...{
					name: controlID,
					properties: {
						...controlSchema.properties,
						//For lookup related records fix, on edit and save (Bug 7358).
						...typeof record === "string" ? { objectId: record } : record && { record },
						controlID: controlID,
						"queryParams": { ...queryParams },
						...rootPageContext && rootPageContext["pagesPath"] && {
							"pagesPath": rootPageContext["pagesPath"],
						}
					}
				},
			};
			if (controlSchema.properties["ui:widget"] === Actions.WIDGETTYPE.FORM || controlSchema.properties["ui:widget"] === "itsy:form") {
				drawerData["onOKTransition"] = {
					controlID,
					strict: true,
					type: Actions.STATE.FORM_SUBMIT_CLICK,
				};
			} else {
				drawerData["onOKTransition"] = metadata.onOKTransition;
			}
			drawerData["closable"] = metadata.closable !== undefined ? metadata.closable : true;
			drawerData["showOK"] = metadata.controlSchema.properties.showOK !== undefined ? metadata.controlSchema.properties.showOK : true;
			drawerData["showCancel"] = metadata.controlSchema.properties.showCancel !== undefined ? metadata.controlSchema.properties.showCancel : true;
			drawerData["okText"] = metadata.controlSchema.properties.okText !== undefined ? metadata.controlSchema.properties.okText : undefined
			drawerData["cancelText"] = metadata.controlSchema.properties.cancelText !== undefined ? metadata.controlSchema.properties.cancelText : undefined
			drawerData["onCancelTransition"] = {
				type: Actions.STATE.HIDE_DRAWER,
			};
			drawerData["customState"] = {
				contextPath: {
					...getCustomWidgetContextPath(controlSchema),
					...rootPageContext && rootPageContext.pageId && { pageId: rootPageContext.pageId },
				},
			};
			transition({
				type: Actions.STATE.SHOW_DRAWER,
				event: drawerData,
			});
		},
	};
	return commandObj;
});
