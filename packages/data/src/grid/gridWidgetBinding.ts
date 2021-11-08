import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, ICommandManager, ICustomStateMachineData, IDataSourceLake, IPageBindProvider } from "@itsy-ui/core";
import { getCommandContext } from "./actions";
import {
	getUpdatedFilter
} from "./utils";
import { getFeatureKey, generateURLQueryParams, RegExPatterns, getSubscriberControlIdWithTypeAndSchemaId, getSubscriberWidgetControlId, getWidgetId } from "@itsy-ui/utils";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const pageBindProvider: IPageBindProvider = dataLoader.getLoader("pageBindProvider");
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");

const Actions = {
	State: {
		Form: {
			FORM_LOADED: "FORM_LOADED",
		},
		Grid: {
			GRID_SELECTED_ROWS_DONE: "GRID_SELECTED_ROWS_DONE",
			GRID_REFRESH: "GRID_REFRESH",
		},
		Page: {
			PAGE_GET_STATE: "PAGE_GET_STATE",
		},
		Drawer: {
			HIDE_DRAWER: "HIDE_DRAWER",
		},
		Indicator: {
			HIDE_INDICATOR: "HIDE_INDICATOR",
		},
	},
	Features: {
		NavigationOnGridRowSelection: "navigationOnGridRowSelection",
		UpdateCustomDataSource: "updateCustomDataSource",
		RefreshGridAfterFormSubmit: "refreshGridAfterFormSubmit",
		SetDefaultFilter: "setDefaultFilter",
		UpdateDetailGridContext: "updateDetailGridContext",
		InvokeCommandOnGridRowSelect: "invokeCommandOnGridRowSelect",
	},
};

function doGridBinderNavigateURL(evt: any, currentPage: any) {
	return async (_getState, _dispatch, transition) => {
		const { controlID, selectedRows } = evt;
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.NavigationOnGridRowSelection);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		if (currentPage["pageBinding"][widgetId]) {
			const featureKey = getFeatureKey(currentPage, Actions.Features.NavigationOnGridRowSelection, widgetId);
			const metadata = currentPage["pageBinding"][widgetId][featureKey]["metadata"]; //getting data from current features
			const params = generateURLQueryParams(metadata, selectedRows[selectedRows.length - 1]);
			if (metadata && metadata["pageURL"]) {
				const history = WidgetsFactory.instance.services["history"];
				const baseURL = history.location.pathname.split("/");
				baseURL.pop();
				const url = `${baseURL.join("/")}/${metadata["pageURL"]}${params && params}`;
				transition({
					type: "NAVIGATE_URL",
					url: url,
				});
			} else {
				// tslint:disable-next-line: no-console
				console.error("Page not found");
			}
		}
		transition({
			controlID: controlID,
			strict: true,
			type: "GRID_SELECTED_ROWS_DONE",
			selectedRows: evt.selectedRows,
		});
	};
}

const navigationOnGridRowSelectionStateMachine = (currentPage) => {
	const navigateURLGridBinding: ICustomStateMachineData = {
		name: "navigateURLGridBinding",
		stateJSON: {
			"states": {
				"gridSelectedRows": {
					"onEntry": [
						"onGridBinderNavigateURL",
					],
					"on": {
						"GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onGridBinderNavigateURL: (evt) => dispatch(doGridBinderNavigateURL(evt, currentPage)),
			};
		},
	};

	return navigateURLGridBinding;
};

pageBindProvider.putSchema("GridWidget", "navigationOnGridRowSelection", navigationOnGridRowSelectionStateMachine);

function doCustomGridInit(event: any, currentPage: any) {
	return async (_getState, _dispatch: any, transition: any) => {
		const { typeId, gridSchemaId, controlID } = event;
		const feature = "updateCustomDataSource";
		const currentWidgetId = getWidgetId(currentPage, controlID, feature);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, feature, widgetId);
		const customDatasourceName = currentPage["pageBinding"][widgetId] ? currentPage["pageBinding"][widgetId][featureKey]["metadata"]["datasource"] : "";
		if (customDatasourceName) {
			transition({
				controlID: controlID,
				strict: true,
				type: "GRID_LOAD",
				typeId: event.typeId,
				gridSchemaId: event.gridSchemaId,
				customDatasource: dataLoader.getLoader<IDataSourceLake>(customDatasourceName),
			});
		} else {
			transition({
				...event,
				controlID: controlID,
				strict: true,
				type: "GRID_LOAD",
			});
		}
	};
}

const updateCustomDataSource = (currentPage) => {
	const customDataSourceGridBinding: ICustomStateMachineData = {
		name: "customDataSourceGridBinding",
		stateJSON: {
			"states": {
				"gridInit": {
					"onEntry": [
						"onCustomGridInit",
					],
					"on": {
						"GRID_LOAD": "gridLoad",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onCustomGridInit: (evt) => dispatch(doCustomGridInit(evt, currentPage)),
			};
		},
	};

	return customDataSourceGridBinding;
};

pageBindProvider.putSchema("GridWidget", Actions.Features.UpdateCustomDataSource, updateCustomDataSource);

function doGridRefreshAfterFormSubmit(event: any, currentPage: any) {
	return (_getState, _dispatch, transition) => {
		const { controlID } = event;
		let subscribeWidgetControlID;
		if (controlID.match(RegExPatterns.GUID)) { // checking controlID is GUID or not
			subscribeWidgetControlID = getSubscriberWidgetControlId(currentPage, controlID, Actions.Features.RefreshGridAfterFormSubmit);
		} else {
			subscribeWidgetControlID = getSubscriberControlIdWithTypeAndSchemaId(currentPage, controlID, Actions.Features.RefreshGridAfterFormSubmit);
		}
		transition({
			...subscribeWidgetControlID && { controlID: subscribeWidgetControlID, strict: true },
			type: Actions.State.Grid.GRID_REFRESH,
		});
		transition({
			controlID: controlID,
			strict: true,
			type: Actions.State.Form.FORM_LOADED,
		});
	};
}

const refreshGridAfterFormSubmitStateMachine = (currentPage) => {
	const gridRefreshAfterFormSubmitBinding: ICustomStateMachineData = {
		name: "GridAfterFormSubmitState",
		stateJSON: {
			"states": {
				"formAfterSubmit": {
					"onEntry": [
						"onGridAfterFormSubmit",
					],
					"on": {
						"FORM_LOADED": "onLoaded",
						"FORM_VALUE_RESET": "formValueReset",
						"FORM_EXIT": "formExit",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onGridAfterFormSubmit: (event) => dispatch(doGridRefreshAfterFormSubmit(event, currentPage)),
			};
		},
	};

	return gridRefreshAfterFormSubmitBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.RefreshGridAfterFormSubmit, refreshGridAfterFormSubmitStateMachine);

function onDefaultFilterGridInit(event: any, currentPage: any) {
	return async (_getState, _dispatch, transition) => {
		const { controlID, queryParams } = event;
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.SetDefaultFilter);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, Actions.Features.SetDefaultFilter, widgetId);
		const metadata = currentPage["pageBinding"][widgetId][featureKey]["metadata"]; //getting data from current features
		let { filter } = metadata;
		if (typeof filter === "string") {
			try {
				filter = JSON.parse(filter);
			} catch {
				filter = {};
			}
		}
		filter = await getUpdatedFilter(filter, queryParams, transition);
		transition({
			...event,
			controlID: controlID,
			strict: true,
			type: "GRID_LOAD",
			filterText: filter,
		});
	};
}

const setDefaultFilterStateMachine = (currentPage) => {
	const gridSetDefaultFilterBinding: ICustomStateMachineData = {
		name: "setDefaultFilter",
		stateJSON: {
			"states": {
				"gridInit": {
					"onEntry": [
						"onDefaultFilterGridInit",
					],
					"on": {
						"GRID_LOAD": "gridLoad",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onDefaultFilterGridInit: (evt) => dispatch(onDefaultFilterGridInit(evt, currentPage)),
			};
		},
	};

	return gridSetDefaultFilterBinding;
};

pageBindProvider.putSchema("GridWidget", Actions.Features.SetDefaultFilter, setDefaultFilterStateMachine);

function doUpdateGridContextFromGrid(event: any, currentPage: any) {
	return async (_getState, _dispatch, transition) => {
		const { controlID, selectedRows } = event;
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.UpdateDetailGridContext);
		let subscribeWidgetControlID;
		if (controlID.match(RegExPatterns.GUID)) { // checking controlID is GUID or not
			subscribeWidgetControlID = getSubscriberWidgetControlId(currentPage, controlID, Actions.Features.UpdateDetailGridContext);
		} else {
			subscribeWidgetControlID = getSubscriberControlIdWithTypeAndSchemaId(currentPage, controlID, Actions.Features.UpdateDetailGridContext);
		}
		if (subscribeWidgetControlID && currentPage["pageBinding"][subscribeWidgetControlID]) {
			const featureKey = getFeatureKey(currentPage, Actions.Features.UpdateDetailGridContext, subscribeWidgetControlID);
			const metadata = currentPage["pageBinding"][subscribeWidgetControlID][featureKey]["metadata"]; //getting data from current features
			let { filter } = metadata;

			if (typeof filter === "string") {
				try {
					filter = JSON.parse(filter);
				} catch {
					filter = {};
				}
			}
			filter = await getUpdatedFilter(filter, selectedRows[selectedRows.length - 1], transition);

			if (filter && Object.keys(filter).length > 0) {
				transition({
					controlID: subscribeWidgetControlID,
					strict: true,
					type: "GRID_FILTER",
					searchValue: filter,
				});
			}
		}
		transition({
			controlID: controlID,
			strict: true,
			type: "GRID_SELECTED_ROWS_DONE",
			selectedRows: selectedRows,
		});
	};
}

const updateGridContextFromGridStateMachine = (currentPage) => {
	const updateGridContextFromGridBinding: ICustomStateMachineData = {
		name: "UpdateDetailGridContext",
		stateJSON: {
			"states": {
				"gridSelectedRows": {
					"onEntry": [
						"onUpdateGridContextFromGrid",
					],
					"on": {
						"GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onUpdateGridContextFromGrid: (evt) => dispatch(doUpdateGridContextFromGrid(evt, currentPage)),
			};
		},
	};

	return updateGridContextFromGridBinding;
};

pageBindProvider.putSchema("GridWidget", Actions.Features.UpdateDetailGridContext, updateGridContextFromGridStateMachine);

function doInvokeCommandOnGridRowSelect(evt: any, currentPage: any) {
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, _dispatch: any, transition: any) => {
		const { controlID, selectedRows } = evt;
		const { typeId, gridSchemaId, customDataSource, pageContext } = getState();
		const contextPath: any = { typeId, ...gridSchemaId && { gridSchemaId } };
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.InvokeCommandOnGridRowSelect);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		if (currentPage.pageBinding[widgetId]) {
			const featureKey = getFeatureKey(currentPage, Actions.Features.InvokeCommandOnGridRowSelect, widgetId);
			const metdata = currentPage.pageBinding[widgetId][featureKey].metadata; //getting data from current features
			const commandData = { ...metdata, ...{ name: metdata.commandName } };
			const contextParams: any = {
				contextPath: contextPath,
				context: {
					...getCommandContext(commandData, { typeId, record: selectedRows[selectedRows.length - 1], customDataSource, controlID }),
					pageContext
				},
			};
			let cmd = commandManager.getCommand(commandData.name, contextPath);
			if (!cmd) {
				cmd = commandManager.getCommand(commandData.name, {});
			}
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.State.Grid.GRID_SELECTED_ROWS_DONE,
				selectedRows: selectedRows,
			});
			try {
				await cmd!.execute(contextParams.context, transition);
			} catch (e) {
			}
		}
	};
}

const invokeCommandOnGridRowSelect = (currentPage) => {
	const invokeCommandOnGridRowSelectBinding: ICustomStateMachineData = {
		name: "invokeCommandOnGridRowSelectBinding",
		stateJSON: {
			"states": {
				"gridSelectedRows": {
					"onEntry": [
						"onInvokeCommandOnGridRowSelect",
					],
					"on": {
						"GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onInvokeCommandOnGridRowSelect: (evt) => dispatch(doInvokeCommandOnGridRowSelect(evt, currentPage)),
			};
		},
	};

	return invokeCommandOnGridRowSelectBinding;
};

pageBindProvider.putSchema("GridWidget", Actions.Features.InvokeCommandOnGridRowSelect, invokeCommandOnGridRowSelect);
