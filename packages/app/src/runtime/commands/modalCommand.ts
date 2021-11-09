import { WidgetsFactory } from "@itsy-ui/core";
import { CommandOptions } from "@itsy-ui/core";
import { getPageContext, getUrlParams } from "@itsy-ui/utils";
import { canExecuteCommand } from "../helpers/utils";
import { getContext, getCustomWidgetContextPath, getCustomWidgetControlId, getFormContext, getRuntimeQueryParams } from "./commandUtils";

const Actions = {
	MODAL: "modal",
	WIDGETTYPE: {
		FORM: "form",
		CUSTOM: "custom",
	},
	STATE: {
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
		HIDE_MODAL: "HIDE_MODAL",
		SHOW_MODAL: "SHOW_MODAL",
		PAGE_GET_STATE: "PAGE_GET_STATE",
	},
};

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const commandBindProvider = dataLoader.getLoader("commandBindProvider");

// modal
commandBindProvider.putSchema("modal", (metadata) => {
	const commandObj: CommandOptions<any> = {
		canExecute: (data: any, _transition: (data: any) => void) => {
			return canExecuteCommand(data["config"]);
		},
		execute: async (data: any, transition: (data: any) => void) => {
			const { controlSchema } = metadata;
			const record = controlSchema.properties["ui:widget"] === Actions.WIDGETTYPE.FORM || controlSchema.properties["ui:widget"] === "itsy:form" ? getFormContext(data) : getContext(data);
			const modalData: any = {};
			modalData["title"] = metadata.title;
			let queryParams = getUrlParams(window.location.search);
			const commandQueryParams = data.queryParams ? data.queryParams : {};
			const rootPageContext: any = data.pageContext;
			queryParams = controlSchema.properties["ui:widget"] === "r" || controlSchema.properties["ui:widget"] === "itsy:page" ?
				{ ...getRuntimeQueryParams(controlSchema.properties["pageQueryParams"], { ...queryParams, ...commandQueryParams }, record) } :
				{ ...rootPageContext && rootPageContext.queryParams && rootPageContext.queryParams, ...commandQueryParams };
			const pageId = rootPageContext && rootPageContext.pageId ? rootPageContext.pageId : null;
			if (controlSchema.properties["ui:widget"] === Actions.WIDGETTYPE.FORM || controlSchema.properties["ui:widget"] === "itsy:form") {
				const controlID = getCustomWidgetControlId(controlSchema);
				modalData.controlSchema = {
					...{
						name: controlSchema.name,
						properties: {
							...controlSchema.properties,
							//For lookup related records fix, on edit and save (Bug 7358).
							...typeof record === "string" ? { objectId: record } : record && { record },
							controlID: controlID,
							"queryParams": { ...queryParams },
						}
					},
				};
				modalData["onOKTransition"] = {
					controlID,
					strict: true,
					type: Actions.STATE.FORM_SUBMIT_CLICK,
				};
				modalData["onCancelTransition"] = {
					type: Actions.STATE.HIDE_MODAL,
				};
				modalData["customState"] = {
					contextPath: {
						...getCustomWidgetContextPath(controlSchema),
						pageId,
					},
				};
			} else {
				modalData["showCloseButton"] = metadata.showCloseButton !== undefined ? metadata.showCloseButton : true;
				modalData["showOKButton"] = metadata.showOK !== undefined ? metadata.showOK : false;
				modalData["showCancelButton"] = metadata.showCancel !== undefined ? metadata.showCancel : false;
				const controlID = getCustomWidgetControlId(controlSchema);
				const rootPageContext = controlSchema.properties["ui:widget"] === "r" || controlSchema.properties["ui:widget"] === "itsy:page" ? getPageContext(transition) : {}
				modalData["controlSchema"] = {
					...{
						name: controlSchema.name,
						properties: {
							...controlSchema.properties,
							...record && { record },
							controlID: controlID,
							...rootPageContext && rootPageContext["pagesPath"] && { "pagesPath": rootPageContext["pagesPath"] },
							...queryParams && { queryParams }
						}
					},
				};
				modalData["onCancelTransition"] = {
					type: Actions.STATE.HIDE_MODAL,
				};
				modalData["customState"] = {
					contextPath: {
						...getCustomWidgetContextPath(controlSchema),
						pageId
					},
				};
			}
			modalData["showOKButton"] = metadata.controlSchema.properties.showOKButton !== undefined ? metadata.controlSchema.properties.showOKButton : true;
			modalData["showCancelButton"] = metadata.controlSchema.properties.showCancelButton !== undefined ? metadata.controlSchema.properties.showCancelButton : true;
			modalData["okText"] = metadata.controlSchema.properties.okText !== undefined ? metadata.controlSchema.properties.okText : undefined
			modalData["cancelText"] = metadata.controlSchema.properties.cancelText !== undefined ? metadata.controlSchema.properties.cancelText : undefined
			modalData["width"] = metadata.controlSchema.properties.width !== undefined ? metadata.controlSchema.properties.width : "sm"
			modalData["showCloseButton"] = metadata.controlSchema.properties.closable !== undefined ? metadata.controlSchema.properties.closable : true;
			transition({
				type: Actions.STATE.SHOW_MODAL,
				event: modalData,
			});
		},
	};
	return commandObj;
});
