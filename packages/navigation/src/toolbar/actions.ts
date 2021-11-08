import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager } from "@itsy-ui/core";

export const ToolbarActions = {
	LoadData: "ToolbarActions.LoadData",
	Init: "ToolbarActions.Init",
	State: {
		TOOLBAR_BEFORE_INIT: "TOOLBAR_BEFORE_INIT",
		TOOLBAR_INIT: "TOOLBAR_INIT",
		TOOLBAR_ON_LOADED: "TOOLBAR_ON_LOADED",
		TOOLBAR_REFRESH: "TOOLBAR_REFRESH",
		TOOLBAR_COMMANDEXECUTE: "TOOLBAR_COMMANDEXECUTE",
	},
};

function loadData(data: any[], contextParams: any) {
	return {
		type: ToolbarActions.LoadData,
		items: data,
		contextParams: contextParams,
	};
}

function onInitToolbar(typeId: string, contextParams: any) {
	return {
		type: ToolbarActions.Init,
		typeId: typeId,
		contextParams: contextParams !== undefined ? contextParams : {},
	};
}

export function doToolbarBeforeInit(evt: any) {
	return async (_, dispatch: any, transition: any) => {
		dispatch(onInitToolbar(evt.typeId, evt.contextParams));
		transition({
			type: ToolbarActions.State.TOOLBAR_INIT,
			items: evt.items,
			typeId: evt.typeId,
			params: {
				contextParams: evt.contextParams ? evt.contextParams : null,
				designerMetadata: evt.designerMetadata ? evt.designerMetadata : null,
				pageContext: evt.pageContext ? evt.pageContext : null
			},
		});
	};
}

export function doToolbarInit(evt: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: ToolbarActions.State.TOOLBAR_REFRESH,
			items: evt.items,
			typeId: evt.typeId,
			params: evt.params ? evt.params : {},
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
		return removeDuplicates(s3, "name");
	}
}

export function doToolbarRefresh(evt: any) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, dispatch: any, transition: any) => {
		const { items, typeId, contextParams } = getState();
		const mergedItems = evt.params && evt.params.designerMetadata ? JSON.parse(JSON.stringify(evt.items)) : JSON.parse(JSON.stringify(mergeItems(items, evt.items)));
		const contextPath = evt.params && evt.params.contextPath ? evt.params.contextPath : {};
		const context = evt.params && evt.params.context ? evt.params.context : {};
		const pageContext = evt.params && evt.params.pageContext ? evt.params.pageContext : {};
		// append typeId in the context always
		context.typeId = typeId;
		const cParams = evt.params && evt.params.contextParams ? evt.params.contextParams : contextParams;
		const commandContext = {
			...context,
			...cParams,
			...pageContext
		};
		const refreshedItems = mergedItems.map(t => {
			if (evt.params && evt.params.designerMetadata) {
				t.enabled = true;
			} else {
				const cmd = commandManager.getCommand(t.name, contextPath);
				const data = { "data": commandContext, "config": t };
				if (cmd !== null) {
					t.enabled = cmd.canExecute(data, transition);
				} else {
					t.enabled = false;
				}
			}
			return t;
		});

		dispatch(loadData(refreshedItems, evt.params));
		transition({
			type: ToolbarActions.State.TOOLBAR_ON_LOADED,
		});
	};
}

const getCommandContext = (currentItem: any = {}, context: {}, contextParams: {}) => {
	const { bounded } = currentItem;
	if (bounded === undefined || bounded) {
		return {
			...context,
			...contextParams,
		};
	}
	return {};
};

export function doExecuteCommand(evt: any) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, _dispatch: any, transition: any) => {
		// contextParams is available when TOOLBAR_REFRESH is used by the parent container
		const { typeId, contextParams } = getState();
		const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
		const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
		// append typeId in the context always
		context.typeId = typeId;
		context.currentObject = evt.currentObject;
		const commandContext = getCommandContext(evt.currentObject, context, contextParams);
		if (evt.queryParams) {
			commandContext["queryParams"] = evt.queryParams;
		}
		const cmd = commandManager.getCommand(evt.name, contextPath);
		try {
			await cmd!.execute(commandContext, transition);
			transition({
				type: ToolbarActions.State.TOOLBAR_ON_LOADED,
			});
		} catch (e) {
			transition({
				type: ToolbarActions.State.TOOLBAR_ON_LOADED,
			});
			throw e;
			//console.log("Command execution error: ", e);
		}
	};
}
