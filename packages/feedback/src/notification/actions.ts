import { WidgetsFactory } from "@itsy-ui/core";

export const NotificationAction = {
    showNotification: "NotificationAction.showNotification",
    hideNotification: "NotificationAction.hideNotification",
    State: {
        NOTIFICATION_LOADED: "NOTIFICATION_LOADED",
    },
};

export function doShowNotification(event: any) {
    return async (_, dispatch: any, transition: any, _params: any) => {
        dispatch({
            type: NotificationAction.showNotification,
            message: event.message,
            metadata: event.metadata,
            action: event.action,
            visibility: true
        });
        transition({
            type: NotificationAction.State.NOTIFICATION_LOADED,
        });
    };
}

export function doDisableNotification() {
    return async (_, dispatch: any, _transition: any) => {
        dispatch({
            type: NotificationAction.hideNotification,
            visibility: false,
        });
    };
}

export function onhandleAction(name: any) {
    const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
    const commandManager = dataLoader.getLoader("commandManager");
    return async (_getState: any, _dispatch: any, transition: any) => {
        const cmd = commandManager.getCommand(name, {});
        try {
            await cmd!.execute({}, transition);
        } catch (e) {
            throw e;
            //console.log("Command execution error: ", e);
        }
    };
}