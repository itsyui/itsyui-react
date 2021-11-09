import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager, ISchemaLoader } from "@itsy-ui/core";

export const NavbarActions = {
	State: {
		NAVBAR_INIT: "NAVBAR_INIT",
		NAVBAR_REFRESH: "NAVBAR_REFRESH",
		NAVBAR_COMMANDEXECUTE: "NAVBAR_COMMANDEXECUTE",
		NAVBAR_ON_LOADED: "NAVBAR_ON_LOADED",
		NAVBAR_DONE: "NAVBAR_DONE",
	},
	AppState: {
		NAVIGATE_URL: "NAVIGATE_URL",
	},
	Loader: "NavbarWidget_Schema",
	LoadMetadata: "NavbarActions.LoadMetadata",
	SelectNavbarItem: "NavbarActions.SelectNavbarItem",
};

function loadMetadata(data: any) {
	return {
		type: NavbarActions.LoadMetadata,
		data,
	};
}

export function doShowSelectNavbarItem(data: any) {
	return {
		type: NavbarActions.SelectNavbarItem,
		data,
	};
}

export function doNavbarInit(event) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		let data = event ? event.data : {};
		if (!data || Object.keys(data).length === 0) {
			const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
			const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>(NavbarActions.Loader);
			data = await schemaLoader.getControlSchema({});
		}
		transition({
			type: NavbarActions.State.NAVBAR_REFRESH,
			items: data ? data : {},
		});
	};
}

function removeDuplicates(myArr: any[], prop: any) {
	return myArr.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
	});
}

function mergeItems(s1: any, s2: any) {
	if (s1 === undefined || s1 !== undefined && s1.length === 0) {
		return s2;
	} else if (s2 === undefined || s2 !== undefined && s2.length === 0) {
		return s1;
	} else {
		const s3 = [].concat(s1, s2);
		return removeDuplicates(s3, "id");
	}
}

export function doNavbarRefresh(items: any, reset?: boolean) {
	return async (getState: any, dispatch: any, transition: any) => {
		const { data } = getState();

		if ((reset === undefined || !reset) && data !== undefined && Object.keys(data).length > 0) {
			const navItems = {};
			Object.keys(data).map(t => {
				if (items.hasOwnProperty(t)) {
					navItems[t] = mergeItems(data[t], items[t]);
				}
			});
			dispatch(loadMetadata(navItems));
		} else {
			dispatch(loadMetadata(items));
		}
		transition({
			type: NavbarActions.State.NAVBAR_ON_LOADED,
		});
	};
}

export function doNavItemClick(navItemData: any) {
	return async (_getState: any, dispatch: any, transition: any) => {
		dispatch(doShowSelectNavbarItem(navItemData));
		if (navItemData.url !== undefined && navItemData.url !== "") {
			transition({
				type: NavbarActions.AppState.NAVIGATE_URL,
				url: navItemData.url,
			});
		} else {
			transition({
				type: NavbarActions.State.NAVBAR_COMMANDEXECUTE,
				navItemData,
			});

		}
	};
}

export function doNavbarCommandExecute(navItemData: any) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, _dispatch: any, transition: any) => {
		const { contextParams } = getState();
		const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
		const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
		const cmd = commandManager.getCommand(navItemData.id, contextPath);
		transition({
			type: NavbarActions.State.NAVBAR_ON_LOADED,
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

export function doNavbarGetState(onData: any) {
	return async (getState, _dispatch: any, transition: any) => {
		transition({
			type: NavbarActions.State.NAVBAR_DONE,
		});
		const navbarState = getState();
		onData.call(null, navbarState);
	};
}
