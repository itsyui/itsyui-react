/* eslint-disable linebreak-style */
import { setItemInLocalStorage, getItemFromLocalStorage, getRolesForUser, getAllTypeDefs } from "@itsy-ui/utils";

export const AppStateActions = {
	AppDataAvailable: "AppState.AppDataAvailable",
	AppDataUpdate: "AppState.AppDataUpdate",
	State: {
		FV_APPSTATE_INIT: "FV_APPSTATE_INIT",
		FV_APPSTATE_GET_STATE: "FV_APPSTATE_GET_STATE",
		FV_APPSTATE_LOADED: "FV_APPSTATE_LOADED",
		FV_APPSTATE_INIT_ROLES: "FV_APPSTATE_INIT_ROLES",
	},
};

export function doAppStateInit(evt: any) {
	return async (_, dispatch: any, transition: any) => {
		try {
			const storeData = {
				extraParams: evt.extraParams ? evt.extraParams : {}
			};
			setItemInLocalStorage("FV_APPSTATE", JSON.stringify(storeData));
			dispatch({
				type: AppStateActions.AppDataAvailable,
				appData: storeData,
			});
			transition({
				type: AppStateActions.State.FV_APPSTATE_INIT_ROLES,
			});
		} catch (e) {
			// tslint:disable-next-line:no-console
			console.error(JSON.stringify(e));
		}
	};
}

export function doRolesInit() {
	return async (getState: any, dispatch: any, transition: any) => {
		try {
			const userRolesData = await getRolesForUser();
			const { appData } = getState();
			const storeData = {
				...appData,
				roles: userRolesData.length > 0 ? userRolesData : [],
			};
			const localStorageAppState = getItemFromLocalStorage("FV_APPSTATE");
			setItemInLocalStorage("FV_APPSTATE", JSON.stringify({ ...localStorageAppState, ...storeData }));
			dispatch({
				type: AppStateActions.AppDataAvailable,
				appData: storeData,
			});
			transition({
				type: AppStateActions.State.FV_APPSTATE_LOADED,
			});
		} catch (e) {
			// tslint:disable-next-line:no-console
			console.error(JSON.stringify(e));
			transition({
				type: AppStateActions.State.FV_APPSTATE_LOADED,
			});
		}
	};
}

export function doPropDefsInit() {
	return async (getState: any, dispatch: any, transition: any) => {
		try {
			const { appData } = getState();
			const allTypeIds = await getAllTypeDefs();
			const allTypeDefs = allTypeIds.map(t => Object.assign({ "typeId": t.type.id, "metadata": t.type }));
			const storeData = {
				...appData,
				metadata: allTypeDefs,
			};
			dispatch({
				type: AppStateActions.AppDataAvailable,
				appData: storeData,
			});
			transition({
				type: AppStateActions.State.FV_APPSTATE_LOADED,
			});
		} catch (e) {
			// tslint:disable-next-line:no-console
			console.error(JSON.stringify(e));
			transition({
				type: AppStateActions.State.FV_APPSTATE_LOADED,
			});
		}
	};
}

export function doAppGetState(onData: any) {
	return async (getState, _dispatch: any, transition: any) => {
		transition({
			type: AppStateActions.State.FV_APPSTATE_LOADED,
		});
		const state = getState();
		onData.call(null, state);
	};
}

export function doAppStateUpdate(params: any) {
	return async (getState, dispatch: any, transition: any) => {

		const { appData } = getState();
		const updatedContext = { ...appData["extraParams"], ...params };
		dispatch({
			type: AppStateActions.AppDataUpdate,
			updatedContext,
		});
		transition({
			type: AppStateActions.State.FV_APPSTATE_LOADED,
		});
	};
}
