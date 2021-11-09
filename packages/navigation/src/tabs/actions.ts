/* eslint-disable */
import { getLocaleString, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ISchemaLoader } from "@itsy-ui/core";

export const TabsActions = {
	State: {
		TABS_INIT: "TABS_INIT",
		TABS_LOAD: "TABS_LOAD",
		TABS_BEFORE_ADD_NEW_TAB: "TABS_BEFORE_ADD_NEW_TAB",
		TABS_ADD_NEW_TAB: "TABS_ADD_NEW_TAB",
		TABS_ACTIVE_TAB_CHANGE: "TABS_ACTIVE_TAB_CHANGE",
		TABS_CLOSE_CURRENT_TAB: "TABS_CLOSE_CURRENT_TAB",
		TABS_DONE: "TABS_DONE",
		NAVIGATE_URL: "NAVIGATE_URL",
	},
	LoadData: "TabsActions.LoadData",
	UpdateActiveTabsKey: "TabsActions.UpdateActiveTabsKey",
	NewTab: "TabsActions.NewTab",
	RemoveTab: "TabsActions.RemoveTab",
};

export function doTabsInit(event: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>("FormWidget");
		let data: any = [];
		if (event.tabItems && event.tabItems.length > 0) {
			data = event.tabItems.map((t, index) => {
				return {
					title: t.title,
					content: {
						"name": t.name,
						"properties": {
							...t.content,
							"designerMetadata": event.designerMetadata ? event.designerMetadata : null,
						},
					},
					key: index,
					closable: false,
					path: t.path,
					icon: t.icon,
					primary: t.primary,
				};
			});
		} else if (event.typeId) {
			const formSchemaEntity = {
				typeId: event.typeId,
			};
			if (event.schemaId !== undefined && event.schemaId !== "") {
				formSchemaEntity["formSchemaId"] = event.schemaId;
			}
			const formSchema = await schemaLoader.getControlSchema(formSchemaEntity);
			const formSchemaProps = {
				"name": "form",
				"properties": {
					"ui:widget": "form",
					"typeId": event.typeId,
					"formSchema": formSchema,
				},
			};
			if (event.objectData !== undefined) {
				formSchemaProps["objectId"] = event.objectData;
			}
			data.push({
				title: formSchema.displayName,
				content: formSchemaProps,
				key: "0",
				closable: false,
			});
			event.relationshipViews.map((t, idx) =>
				data.push({
					title: t.displayName, content: {
						"name": "list",
						"properties": {
							"ui:widget": "list",
							queryParamsOptions: {
								"typeId": t.typeId,
								"gridSchemaId": t.gridSchemaId,
								"layout": "table",
								"parentObjectId": event.objectData !== undefined ? event.objectData : undefined,
								"relationshipName": t.name,
							},
						},
					}, key: `${idx + 1}`, closable: false,
				})
			);
		}
		transition({
			type: TabsActions.State.TABS_LOAD,
			data,
		});
	};
}

function loadData(data: any) {
	return {
		type: TabsActions.LoadData,
		newItem: data,
	};
}

export function doTabsLoad(data: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		if (data && data.length > 0) {
			data = data.map(t => {
				return { ...t, "title": getLocaleString(t, "title") };
			});
		}
		dispatch(loadData(data));
		transition({
			type: TabsActions.State.TABS_DONE,
		});
	};
}

let newTabIndex = 0;
export function doTabsBeforeAddNewTab(previousTabs: any) {
	return (_getState: any, _dispatch: any, transition: any) => {
		const activeKey = `newTab${newTabIndex++}`;
		previousTabs.push({
			title: "New Tab",
			key: activeKey,
			content: {
				"name": "form",
				"properties": {
					"ui:widget": "form",
					"typeId": "bc:product",
					"formSchemaId": "bc_productCreate",
				},
			},
		});
		transition({
			type: TabsActions.State.TABS_ADD_NEW_TAB,
			Tabs: previousTabs,
			activeKey: activeKey,
		});
	};
}

function addNewTab(tabs: any, activeKey: string) {
	return {
		type: TabsActions.NewTab,
		tabs: tabs,
		activeKey: activeKey,
	};
}

export function doTabsAddNewTab(tabs: any, activeKey: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(addNewTab(tabs, activeKey));
		transition({
			type: TabsActions.State.TABS_DONE,
		});
	};
}

function activeTabs(activeKey: string) {
	return {
		type: TabsActions.UpdateActiveTabsKey,
		activeKey: activeKey,
	};
}

export function doTabsActiveTabChange(activeKey: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(activeTabs(activeKey));
		transition({
			type: TabsActions.State.TABS_DONE,
		});
	};
}

function removeTab(tabs: any, activeKey: string) {
	return {
		type: TabsActions.RemoveTab,
		tabs: tabs,
		activeKey: activeKey,
	};
}

export function onTabsCloseCurrentTab(tabs: any, activeKey: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(removeTab(tabs, activeKey));
		transition({
			type: TabsActions.State.TABS_DONE,
		});
	};
}

export function dotabsGetState(onData: any) {
	return async (getState, _dispatch: any, transition: any) => {
		transition({
			type: TabsActions.State.TABS_DONE,
		});
		const tabsState = getState();
		onData.call(null, tabsState);
	};
}