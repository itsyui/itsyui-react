
export const AppShellActions = {
	State: {
		APP_BEFORE_LOAD: "APP_BEFORE_LOAD",
		APP_LOAD: "APP_LOAD",
		APP_LOADED: "APP_LOADED",
	},
	AppShellLoad: "AppShellActions.AppShellLoad",
};

export function doAppBeforeLoad(_event: any) {
	return (_, _dispatch, transition) => {
		transition({
			type: AppShellActions.State.APP_LOAD,
		});
	};
}

export function doAppLoad(_event: any) {
	return (_, dispatch, transition) => {
		dispatch({
			type: AppShellActions.AppShellLoad,
		});
		transition({
			type: AppShellActions.State.APP_LOADED,
		});
	};
}
