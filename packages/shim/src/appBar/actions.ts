import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ISchemaLoader, ICommandManager } from "@itsy-ui/core";

export const AppbarActions = {
    State: {
        APPBAR_INIT: "APPBAR_INIT",
        APPBAR_REFRESH: "APPBAR_REFRESH",
        APPBAR_COMMANDEXECUTE: "APPBAR_COMMANDEXECUTE",
        APPBAR_ON_LOADED: "APPBAR_ON_LOADED",
    },
    AppState: {
        NAVIGATE_URL: "NAVIGATE_URL",
    },
    Loader: "AppBarWidget_Schema",
    LoadMetadata: "AppbarActions.LoadMetadata",
    SelectappbarItem: "AppbarActions.SelectappbarItem"

};

function loadMetadata(data: any) {
    return {
        type: AppbarActions.LoadMetadata,
        data,
    };
}

export function doShowSelectAppbarItem(data: any) {
    return {
        type: AppbarActions.SelectappbarItem,
        data,
    };
}

export function doAppBarInit() {
    return async (_getState: any, _dispatch: any, transition: any) => {
        const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
        const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>(AppbarActions.Loader);
        schemaLoader.getControlSchema({})
            .then(t => {
                transition({
                    type: AppbarActions.State.APPBAR_REFRESH,
                    items: t,
                });
            })
            .catch(e => {
                throw e;
            });
    };
}

export function doAppBarRefresh(items: any) {
    return async (getState: any, dispatch: any, transition: any) => {
        const { data } = getState();
        if (data !== undefined && Object.keys(data).length > 0) {
            const appItems = {};
            Object.keys(data).map(t => {
                if (items.hasOwnProperty(t)) {
                    appItems[t] = [...data[t], ...items[t]];
                }
            });
            dispatch(loadMetadata(appItems));
        } else {
            dispatch(loadMetadata(items));
        }
        transition({
            type: AppbarActions.State.APPBAR_ON_LOADED,
        });
    };
}

export function doappItemClick(appItemData: any, typeId: string, gridSchemaId: any) {
    return async (_getState: any, dispatch: any, transition: any) => {
        dispatch(doShowSelectAppbarItem(appItemData));
        if (appItemData.url !== undefined && appItemData.url !== "") {
            transition({
                type: AppbarActions.AppState.NAVIGATE_URL,
                url: appItemData.url,
            });
        } else {
            transition({
                type: AppbarActions.State.APPBAR_ON_LOADED,
            });
            transition({
                type: AppbarActions.State.APPBAR_COMMANDEXECUTE,
                appItemData: appItemData,
                typeId: typeId,
                gridSchemaId: gridSchemaId,
            });

        }
    };
}

export function doAppBarCommandExecute(appItemData: any, typeId: string, gridSchemaId: any) {
    const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
    const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
    return async (getState: any, _dispatch: any, transition: any) => {
        const { contextParams } = getState();
        const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
        const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
        const cmd = commandManager.getCommand(appItemData.name, contextPath);
        context.typeId = typeId;
        context.gridSchemaId = gridSchemaId;
        const commandContext = {
            ...context,
            ...contextPath,
        };
        try {
            await cmd!.execute(commandContext, transition);
            transition({
                type: AppbarActions.State.APPBAR_ON_LOADED,
            });
        } catch (e) {
            throw e;
        }
    };
}
