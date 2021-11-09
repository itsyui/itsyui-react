import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager, ISchemaLoader } from "@itsy-ui/core";

export const SideBarActions = {
	States: {
		SIDEBAR_INIT: "SIDEBAR_INIT",
		SIDEBAR_REFRESH: "SIDEBAR_REFRESH",
		SIDEBAR_ON_LOADED: "SIDEBAR_ON_LOADED",
		SIDEBAR_COMMANDEXECUTE: "SIDEBAR_COMMANDEXECUTE",
	},
	AppStates: {
		NAVIGATE_URL: "NAVIGATE_URL",
	},
	LoadMetadata: "SideBarActions.LoadMetadata",
	SidebarKey: "SideBarActions.SidebarKey",
	UpdateSelectedItem: "SideBarActions.UpdateSelectedItem",
	Toggle: "SideBarActions.Toggle",
};

function loadMetadata(data: any) {
	return {
		type: SideBarActions.LoadMetadata,
		data,
	};
}

function updateSidebarSelectedItem(selectedItem: {}) {
	return {
		type: SideBarActions.UpdateSelectedItem,
		selectedItem,
	};
}

export function doSelectSidebarMenuKey(data: any) {
	return async (_getState: any, dispatch: any, transition: any) => {
		dispatch(updateSidebarSelectedItem(data));
		if (data.url !== undefined && data.url !== "") {
			transition({
				type: SideBarActions.AppStates.NAVIGATE_URL,
				url: data.url,
			});
		} else {
			transition({
				type: SideBarActions.States.SIDEBAR_COMMANDEXECUTE,
				sidebarId: data,
			});
		}
	};
}

export function doSidebarInit(items) {
	return (_, _dispatch: any, transition: any) => {
		transition({
			type: SideBarActions.States.SIDEBAR_REFRESH,
			items: Array.isArray(items) ? items : items && items.default ? items.default : [],
		});
	};
}

export function doSidebarRefresh(sidebarId: string, items?: []) {
	return async (_getState: any, dispatch: any, transition: any) => {
		transition({
			type: SideBarActions.States.SIDEBAR_ON_LOADED,
		});
		if (!items || items.length === 0) {
			const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
			const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>("SidebarWidget");
			const data = await schemaLoader.getControlSchema({});
			const sidebar = sidebarId !== undefined ? sidebarId : "default";
			if (data && Object.keys(data).length !== 0 && data[sidebar]) {
				dispatch(loadMetadata(data[sidebar]));
			}
		} else {
			dispatch(loadMetadata(items));

		}
	};
}

export function doSidebarCommandExecute(sidebarData: any) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, _dispatch: any, transition: any) => {
		const { contextParams } = getState();
		const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
		const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
		context["item"] = sidebarData;
		const cmd = commandManager.getCommand(sidebarData.id, contextPath);
		transition({
			type: SideBarActions.States.SIDEBAR_ON_LOADED,
		});
		if (cmd !== null && cmd !== undefined) {
			try {
				await cmd!.execute(context, transition);
			} catch (e) {
				throw e;
			}
		}
	};
}

export function doSidebarSelectedItem(selectedItem: any) {
	return async (_getState: any, dispatch: any, transition: any) => {
		dispatch(updateSidebarSelectedItem(selectedItem));
		transition({
			type: SideBarActions.States.SIDEBAR_ON_LOADED,
		});
	};
}

export function doSidebarToggle(event: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		const { isExpand } = event; // Based on isExpand prop from prams otherwise reversing the value from reducer
		dispatch({
			type: SideBarActions.Toggle,
			...isExpand !== undefined && isExpand !== null && { isExpand },
		});
		transition({
			type: SideBarActions.States.SIDEBAR_ON_LOADED,
		});
	};
}
