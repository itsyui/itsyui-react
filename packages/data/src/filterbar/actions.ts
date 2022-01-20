import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ISchemaLoader } from "@itsy-ui/core";
import { initApplyFilterFormCustomState } from "./filterbarApplyFilterHandler";
import { initFilterOnChangeFormCustomState } from "./filterbarOnChangeHandler";
import { getFilterQueryAndChips, applyGridFilter, getFormValueFromFilterObj } from "./utils";

export const FilterbarActions = {
	State: {
		FILTERBAR_BEFORE_INIT: "FILTERBAR_BEFORE_INIT",
		FILTERBAR_INIT: "FILTERBAR_INIT",
		FILTERBAR_LOAD: "FILTERBAR_LOAD",
		FILTERBAR_DONE: "FILTERBAR_DONE",
		FILTERBAR_UPDATE: "FILTERBAR_UPDATE",
		FILTERBAR_AFTER_CHANGE: "FILTERBAR_AFTER_CHANGE",
		FILTERBAR_AFTER_APPLY_FILTER: "FILTERBAR_AFTER_APPLY_FILTER",
		FILTERBAR_GET_STATE: "FILTERBAR_GET_STATE",
		FILTERBAR_BEFORE_RESET: "FILTERBAR_BEFORE_RESET",
		FILTERBAR_RESET: "FILTERBAR_RESET",
		FILTERBAR_BEFORE_REMOVE_CHIP: "FILTERBAR_BEFORE_REMOVE_CHIP",
		FILTERBAR_REMOVE_CHIP: "FILTERBAR_REMOVE_CHIP",
	},
	Grid: {
		GRID_FILTER: "GRID_FILTER",
	},
	Form: {
		FORM_REFRESH: "FORM_REFRESH",
		FORM_BEFORE_HANDLE_CHANGE: "FORM_BEFORE_HANDLE_CHANGE",
		FORM_GET_STATE: "FORM_GET_STATE",
	},
	Page: {
		PAGE_GET_STATE: "PAGE_GET_STATE",
	},
	Features: {
		ApplyFilter: "applyFilter",
	},
	LOAD_SCHEMA: "LOAD_SCHEMA",
	UPDATE_FILTERBAR: "UPDATE_FILTERBAR",
};

export function doFilterbarBeforeInit(data: any) {
	return async (_, __, transition) => {
		const { schemaId, operation, applyFilterOnChange, defaultFilter, controlID } = data;
		let { schema } = data;
		let filterContextPath = {};
		try {
			schema = schema && typeof schema === "string" ? JSON.parse(schema) : schema;
			if (schema && schema.propertyDefinitions && Object.keys(schema.propertyDefinitions).length > 0) {
				filterContextPath = getContextPath(controlID);
			} else {
				const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
				const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>("FormWidget");
				schema = await schemaLoader.getControlSchema({ typeId: schemaId, formSchemaId: schemaId });
				filterContextPath = getContextPath(schemaId);
			}
			const formCustomState = applyFilterOnChange ? initFilterOnChangeFormCustomState : initApplyFilterFormCustomState;
			formCustomState(filterContextPath);
		} catch (err) {
			// tslint:disable-next-line:no-console
			console.error(`Error in filtebar init method: ${err}`);
		}
		transition({
			type: FilterbarActions.State.FILTERBAR_INIT,
			formSchema: schema,
			operation,
			filterContextPath,
			defaultFilter,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarInit(data: any) {
	return async (_, __, transition) => {
		const { formSchema, operation, filterContextPath, defaultFilter, controlID } = data;
		let currentFilter, currentChip = null;
		if (defaultFilter) {
			const formValue = getFormValueFromFilterObj(defaultFilter);
			[currentFilter, currentChip] = getFilterQueryAndChips(formValue, operation, formSchema);
		}
		transition({
			type: FilterbarActions.State.FILTERBAR_LOAD,
			formSchema: formSchema,
			operation,
			filterContextPath,
			defaultFilter,
			chips: currentChip,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarLoad(event: any) {
	return async (_getState, dispatch, transition) => {
		const { formSchema, operation, filterContextPath, defaultFilter, chips, controlID } = event;
		dispatch(updateSchema(formSchema, operation, defaultFilter, filterContextPath, chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		if (defaultFilter) {
			applyGridFilter({ transition, controlID, defaultFilter });
		}
	};
}

export function doFilterbarBeforeChange(event: any) {
	return async (getState, _dispatch, transition) => {
		const { filter, controlID } = event;
		const { filters, operation, formSchema, chips } = getState();
		const [currentFilter, currentChip] = getFilterQueryAndChips(filter, operation, formSchema);
		const filterJson = { ...filters, ...currentFilter };
		const chipJson = { ...chips, ...currentChip };
		transition({
			type: FilterbarActions.State.FILTERBAR_AFTER_CHANGE,
			filters: filterJson,
			chips: chipJson,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarAfterChange(event: any) {
	return async (_getState, dispatch, transition) => {
		const { filters, chips, controlID } = event;
		dispatch(updateFilterbarData(filters, chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		applyGridFilter({ transition, controlID, filters });
	};
}

export function doFilterbarApplyFilter(event: any) {
	return async (getState, _dispatch, transition) => {
		const { filters, controlID } = event;
		const { operation, formSchema } = getState();
		const [filterJson, chipJson] = getFilterQueryAndChips(filters, operation, formSchema);
		transition({
			type: FilterbarActions.State.FILTERBAR_AFTER_APPLY_FILTER,
			filters: filterJson,
			chips: chipJson,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarAfterApplyFilter(event: any) {
	return async (_getState, dispatch, transition) => {
		const { filters, chips, controlID } = event;
		dispatch(updateFilterbarData(filters, chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		applyGridFilter({ transition, controlID, filters });
	};
}

export function doFilterbarBeforeReset(event: any) {
	return async (_getState, _dispatch, transition) => {
		const { controlID } = event;
		const filters = {};
		applyGridFilter({ transition, controlID, filters });
		transition({
			type: FilterbarActions.State.FILTERBAR_RESET,
			filters,
			chips: {},
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarReset(event: any) {
	return async (_getState, dispatch, transition) => {
		const { isHardReload, filters, chips, controlID } = event;
		dispatch(updateFilterbarData(filters, chips));
		transition({
			type: FilterbarActions.Form.FORM_REFRESH,
			isHardReload,
			controlID,
			strict: true,
		});
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarBeforeRemoveChip(event: any) {
	return async (getState, _dispatch, transition) => {
		const { fieldKey, controlID } = event;
		let { filters, chips } = getState();
		const formValues = {};
		filters = JSON.parse(JSON.stringify(filters));
		chips = JSON.parse(JSON.stringify(chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		transition({
			type: FilterbarActions.Form.FORM_GET_STATE,
			controlID,
			strict: true,
			onData: (data) => {
				Object.assign(formValues, data.formValues);
			},
		});
		delete filters[fieldKey];
		delete chips[fieldKey];
		formValues[fieldKey] = "";
		transition({
			type: FilterbarActions.State.FILTERBAR_REMOVE_CHIP,
			filters,
			chips,
			formValues,
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarRemoveChip(event: any) {
	return async (_getState, dispatch, transition) => {
		const { filters, chips, formValues, controlID } = event;
		dispatch(updateFilterbarData(filters, chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		transition({
			type: FilterbarActions.Form.FORM_BEFORE_HANDLE_CHANGE,
			value: JSON.parse(JSON.stringify(formValues)),
			controlID,
			strict: true,
		});
	};
}

export function doFilterbarGetState(_evt: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { onData, controlID } = _evt;
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		const filtebarState = getState();
		onData.call(null, filtebarState);
	};
}

export function doFilterbarUpdate(_evt: any) {
	return async (_getState, _dispatch: any, transition: any) => {
		const { filters, chips, formValues, controlID } = _evt;
		_dispatch(updateFilterbarData(filters, chips));
		transition({
			type: FilterbarActions.State.FILTERBAR_DONE,
			controlID,
			strict: true,
		});
		transition({
			type: FilterbarActions.Form.FORM_BEFORE_HANDLE_CHANGE,
			value: JSON.parse(JSON.stringify(formValues)),
			controlID,
			strict: true,
		});
	};
}

function updateSchema(formSchema: any, operation: any, defaultFilter: any, filterContextPath: any, chips: any) {
	return {
		type: FilterbarActions.LOAD_SCHEMA,
		filters: defaultFilter && typeof (defaultFilter) === "string" ? JSON.parse(defaultFilter) : defaultFilter ? defaultFilter : {},
		formSchema,
		operation: operation && typeof (operation) === "string" ? JSON.parse(operation) : operation ? operation : {},
		filterContextPath,
		...defaultFilter && {
			chips,
		}
	};
}

function updateFilterbarData(filters: any, chips: any) {
	return {
		type: FilterbarActions.UPDATE_FILTERBAR,
		filters,
		chips,
	};
}

function getContextPath(schemaId: string) {
	const contextPath = {
		...schemaId && { schemaId },
	};
	return contextPath;
}
