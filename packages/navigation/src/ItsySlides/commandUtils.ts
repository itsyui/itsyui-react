import { WidgetsFactory } from "@itsy-ui/core";
import { isEmptyObject, isNullOrUndefined, generateURLQueryParams, RegExPatterns } from "@itsy-ui/utils";
import { getPageContext, getUrlParams } from "@itsy-ui/utils";

const Actions = {
	Type: {
		NAVIGATE_URL: "NAVIGATE_URL"
	}
}

export const getFormContext = (data: any) => {
	if (!isNullOrUndefined(data)) {
		if (data.hasOwnProperty("selectedRecords")) {
			const selectedRecord = Array.isArray(data.selectedRecords) && data.selectedRecords.length > 0 ? data.selectedRecords[data.selectedRecords.length - 1] : data.selectedRecords;
			return selectedRecord && selectedRecord.hasOwnProperty("cmis:objectId") ? selectedRecord["cmis:objectId"] : selectedRecord;
		} else if (data.hasOwnProperty("record")) {
			return data.record["cmis:objectId"] ? data.record["cmis:objectId"] : data.record;
		}
	}
	return null;
}

export const getContext = (data: any) => {
	if (!isNullOrUndefined(data)) {
		if (data.hasOwnProperty("selectedRecords")) {
			return Array.isArray(data.selectedRecords) && data.selectedRecords.length > 0 ?
				data.selectedRecords[data.selectedRecords.length - 1] : data.selectedRecords;
		} else {
			return data.record ? data.record : null;
		}
	}
	return null;
}

export const getCustomWidgetContextPath = (controlSchema) => {
	if (isEmptyObject(controlSchema)) {
		throw new Error("controlSchema not present");
	}

	const widgetName = controlSchema.properties["ui:widget"];
	switch (widgetName) {
		case "GridWidget":
		case "itsy:grid":
		case "grid":
			return {
				typeId: controlSchema.properties["typeId"],
				...controlSchema.properties["gridSchemaId"] ? { gridSchemaId: controlSchema.properties["gridSchemaId"] } : controlSchema.properties["schemaId"] && { gridSchemaId: controlSchema.properties["schemaId"] },
			};
		case "FormWidget":
		case "itsy:form":
		case "form":
			return {
				typeId: controlSchema.properties["typeId"],
				...controlSchema.properties["formSchemaId"] ? { formSchemaId: controlSchema.properties["formSchemaId"] } : controlSchema.properties["schemaId"] && { formSchemaId: controlSchema.properties["schemaId"] },
			};
		default:
			return {
				typeId: controlSchema.properties["typeId"],
				...controlSchema.properties["schemaId"] && { schemaId: controlSchema.properties["schemaId"] },
			};
	}
};

export const getCustomWidgetControlId = (controlSchema: any) => {
	if (isEmptyObject(controlSchema)) {
		throw new Error("controlSchema not present");
	}

	const widgetName = controlSchema.properties["ui:widget"];
	switch (widgetName) {
		case "GridWidget":
		case "itsy:grid":
		case "grid":
			return controlSchema.properties["typeId"] && controlSchema.properties["gridSchemaId"] ? `${controlSchema.properties["typeId"]}_${controlSchema.properties["gridSchemaId"]}` : controlSchema.properties["typeId"] && controlSchema.properties["schemaId"] && `${controlSchema.properties["typeId"]}_${controlSchema.properties["schemaId"]}`;
		case "FormWidget":
		case "itsy:form":
		case "form":
			return controlSchema.properties["typeId"] && controlSchema.properties["formSchemaId"] ? `${controlSchema.properties["typeId"]}_${controlSchema.properties["formSchemaId"]}` : controlSchema.properties["typeId"] && controlSchema.properties["schemaId"] && `${controlSchema.properties["typeId"]}_${controlSchema.properties["schemaId"]}`;
		default:
			return controlSchema.properties["typeId"] && controlSchema.properties["schemaId"] && `${controlSchema.properties["typeId"]}_${controlSchema.properties["schemaId"]}`;
	}
};

export const executeTransition = (item: any, formValues: any, transition: any, responseData: any = null) => {
	if (item.type === Actions.Type.NAVIGATE_URL && item.pageURL) {
		const history = WidgetsFactory.instance.services["history"];
		const baseURL = history.location.pathname.split("/");
		baseURL.pop();
		const params = generateURLQueryParams(item, { ...formValues, ...responseData });
		const url = `${baseURL.join("/")}/${item["pageURL"]}${params && params}`;
		delete item.pageURL;
		delete item.queryParams;
		item["url"] = url;
	}
	if (responseData) {
		item["responseData"] = responseData;
	}
	transition({ ...item, ...item["controlID"] && { strict: true } });
}

export const getRuntimeQueryParams = (userQueryParams, queryParams = {}, record = {}) => {
	const params = {};
	if (userQueryParams && !isEmptyObject(userQueryParams)) {
		Object.keys(userQueryParams).forEach(t => {
			const matchedValue = userQueryParams[t].value && new RegExp(RegExPatterns.SquareBracket).exec(userQueryParams[t].value);
			if (Array.isArray(matchedValue) && matchedValue.length > 0 && queryParams && queryParams[matchedValue[1]]) {
				params[t] = queryParams[matchedValue[1]];
			} else if (Array.isArray(matchedValue) && matchedValue.length > 0 && record && record.hasOwnProperty(matchedValue[1])) {
				params[t] = record[matchedValue[1]];
			} else {
				params[t] = userQueryParams[t].value ? userQueryParams[t].value : userQueryParams[t].defaultValue
			}
		})
	}
	return params;
}

export function getWidgetSchema(slides: any, transition: any) {
	const widgetSlides = [];
	if (!Array.isArray(slides)) {
		try {
			//if set in builder it will come as string
			const stringSlides: any = slides;
			slides = JSON.parse(stringSlides);
		} catch (ex) {

		}
	}
	for (let slide of slides) {
		const controlSchema: any = slide;
		//const record = controlSchema.properties["ui:widget"] === Actions.WIDGETTYPE.FORM ? getFormContext(data) : getContext(data);
		let widgetData: any = {};
		const controlID = getCustomWidgetControlId(controlSchema);
		let queryParams = getUrlParams(window.location.search);
		const commandQueryParams = controlSchema.properties.pageQueryParams ? controlSchema.properties.pageQueryParams : {};
		const rootPageContext: any = getPageContext(transition);
		const rootPageQueryParams = rootPageContext.urlParams && rootPageContext.urlParams.queryParams ? rootPageContext.urlParams.queryParams : {};
		queryParams = controlSchema.properties["ui:widget"] === "r" || controlSchema.properties["ui:widget"] === "itsy:page" ? { ...getRuntimeQueryParams(controlSchema.properties["pageQueryParams"], { ...queryParams, ...commandQueryParams }, {}) } : { ...rootPageQueryParams, ...commandQueryParams };
		widgetData.controlSchema = {
			...{
				name: controlID,
				properties: {
					...controlSchema.properties,
					//For lookup related records fix, on edit and save (Bug 7358).
					//...typeof record === "string" ? { objectId: record } : record && { record },
					controlID: controlID,
					"queryParams": { ...queryParams },
					...rootPageContext && rootPageContext["pagesPath"] && {
						"pagesPath": rootPageContext["pagesPath"],
					}
				}
			},
		};

		widgetData["customState"] = {
			contextPath: {
				...getCustomWidgetContextPath(controlSchema),
				...rootPageContext && rootPageContext.currentPage && { pageId: rootPageContext.currentPage.id },
			},
		};

		widgetSlides.push(widgetData);
	}

	return widgetSlides;
}