import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager } from "@itsy-ui/core";

export const CardActions = {
	AppActions: {
		State: {
			Indicator: {
				SHOW_INDICATOR: "SHOW_INDICATOR",
				HIDE_INDICATOR: "HIDE_INDICATOR",
			},
			NAVIGATE_URL: "NAVIGATE_URL",
		},
	},
	State: {
		CARD_LOAD: "CARD_LOAD",
		CARD_REFRESH: "CARD_REFRESH",
		CARD_DONE: "CARD_DONE",
		CARD_ON_INIT: "CARD_ON_INIT",
		CARD_EXPAND: "CARD_EXPAND",
		CARD_COLLAPSE: "CARD_COLLAPSE"
	},
	Loader: "CardWidgetSchema",
	DataAvailable: "CardActions.DataAvailable",
	OnRowSelected: "CardActions.OnRowSelected",
	Expand: "CardActions.Expand",
	Collapse: "CardActions.Collapse"
};

function loadMetadata(evt: any) {
	return {
		type: CardActions.DataAvailable,
		data: evt.data,
		pageContext: evt.pageContext
	};
}

export function onNavigateTo(data: any) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
	return async (getState: any, _dispatch: any, transition: any) => {
		if (data.isCommand) {
			const { contextParams, pageContext } = getState();
			const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
			const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
			const cmd = commandManager.getCommand(data.name, contextPath);
			try {
				await cmd!.execute({ ...context, pageContext }, transition);
			} catch (e) {
				// console.log("Command execution error: ", e);
				throw e;
			}
		} else {
			transition({
				type: CardActions.AppActions.State.NAVIGATE_URL,
				url: data.link,
			});
		}
	};
}

export function doCardInit(event: any) {
	return (_, _dispatch: any, transition: any, _params: any) => {
		transition({
			type: CardActions.State.CARD_LOAD,
			data: event.data,
			pageContext: event.pageContext ? event.pageContext : {}
		});
	};
}

export function doCardLoad(event: any) {
	return (_, _dispatch: any, transition: any, _params: any) => {
		transition({
			type: CardActions.State.CARD_REFRESH,
			data: event.data,
			pageContext: event.pageContext
		});
	};
}

export function doCardRefresh(evt: any) {
	return (_, dispatch: any, transition: any, _params: any) => {
		transition({
			type: CardActions.State.CARD_DONE,
		});
		dispatch(loadMetadata(evt));
	};
}

export function doCardExpand(_event: any) {
	return (_, dispatch: any, transition: any) => {
		dispatch({
			type: CardActions.Expand,
		});
		transition({
			type: CardActions.State.CARD_DONE,
		});
	};
}

export function doCardCollapse(_event: any) {
	return (_, dispatch: any, transition: any) => {
		dispatch({
			type: CardActions.Collapse,
		});
		transition({
			type: CardActions.State.CARD_DONE,
		});
	};
}