import { FilterbarActions } from "./actions";
import { getSubscriberControlIds } from "@itsy-ui/utils";

export const applyGridFilter = (event: any) => {
	const { filters, transition, controlID } = event;
	let currentPage;
	transition({
		type: FilterbarActions.Page.PAGE_GET_STATE,
		onData: (data) => {
			currentPage = data.currentPage;
		},
	});
	const subscribeWidgetControlIDs = getSubscriberControlIds(currentPage, controlID, FilterbarActions.Features.ApplyFilter);
	if (Array.isArray(subscribeWidgetControlIDs)) {
		subscribeWidgetControlIDs.forEach(t => {
			transition({
				controlID: t,
				strict: true,
				type: FilterbarActions.Grid.GRID_FILTER,
				searchValue: filters,
			});
		});
	}
};

export const getFilterQueryAndChips = (filters: any, operation: any, formSchema: any) => {
	const filterJson = {}, chipJson = {};
	const propDefs = formSchema && formSchema.propertyDefinitions ? formSchema.propertyDefinitions : null;
	if (typeof filters === "object" && Object.keys(filters).length > 0) {
		Object.keys(filters).forEach((fKey: string) => {
			const operator = operation && operation[fKey] ? operation[fKey] : "eq";
			const chipName = propDefs && propDefs[fKey] ? propDefs[fKey].displayName : fKey;
			if (filters[fKey]) {
				if (propDefs && propDefs[fKey] && propDefs[fKey].propertyType === "datetime" && typeof (filters[fKey]) === "number" && operator === "eq") { //To get the records based on current date
					const fromTimestamp = filters[fKey];
					let toTimestamp: any = new Date(fromTimestamp);
					toTimestamp = toTimestamp.setHours(23, 59, 59);
					filterJson[fKey] = [{ operation: "gt", value: `${fromTimestamp} and ${fKey} lt ${toTimestamp}` }];
				} else {
					filterJson[fKey] = [{ operation: operator, value: filters[fKey] }];
				}
				if (propDefs && propDefs.hasOwnProperty(fKey)) {
					chipJson[fKey] = { displayName: chipName, value: getChipFilterValue(filters[fKey], propDefs[fKey]) };
				}
			} else {
				filterJson[fKey] = [];
				chipJson[fKey] = { displayName: chipName, value: "" };
			}
		});
	}
	return [filterJson, chipJson];
};

function getChipFilterValue(fValue: any, fieldSchema: any) {
	let value = "";
	if (fValue !== null && fValue !== undefined) {
		if (typeof (fValue) === "object" && Array.isArray(fValue)) {
			value = fValue.join();
		} else if (typeof (fValue) === "object" && !Array.isArray(fValue)) {// date object
			if (Object.keys(fValue).length > 0) {
				const fromDate = new Date(fValue["from"]);
				const toDate = new Date(fValue["to"]);
				value = `${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`;
			} else {
				value = fValue.toLocaleDateString();
			}
		} else if (fieldSchema && fieldSchema.propertyType === "datetime" && typeof (fValue) === "number") {
			const date = new Date(fValue);
			if (date.toString() !== "Invalid Date") {
				value = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
			}
		} else {
			value = fValue;
		}
	}
	return value;
}
