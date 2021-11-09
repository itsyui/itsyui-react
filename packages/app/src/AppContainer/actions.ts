export const AppContainerActions = {
	State: {
		APP_CONTAINER_BEFORE_READY: "APP_CONTAINER_BEFORE_READY",
		APP_CONTAINER_READY: "APP_CONTAINER_READY",
		APP_CONTAINER_READY_DONE: "APP_CONTAINER_READY_DONE",
		APP_CONTAINER_DONE: "APP_CONTAINER_DONE",
	},
	UpdateVisible: "AppContainerActions.UpdateVisible",
	UpdateHide: "AppContainerActions.UpdateHide",
	AddRootElements: "AppContainerActions.AddRootElements",
	UpdatelayoutType: "AppContainerActions.UpdatelayoutType",
	UpdateAppSchema: "AppContainerActions.UpdateAppSchema",
};

export function doAppContainerBeforeReady() {
	return (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: AppContainerActions.State.APP_CONTAINER_READY,
		});
	};
}

export function doAppContainerReady(event: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		transition({
			type: AppContainerActions.State.APP_CONTAINER_READY_DONE,
		});

		dispatch({
			type: AppContainerActions.AddRootElements,
			rootContainerElements: event.rootContainerElements,
			loaded: true,
		});
	};
}

function visibleRegion(regionName: string) {
	return {
		type: AppContainerActions.UpdateVisible,
		regionName,
	};
}

function hideRegion(regionName: string) {
	return {
		type: AppContainerActions.UpdateHide,
		regionName,
	};
}

export function doAppContainerShowRegion(regionName: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(visibleRegion(regionName));
		transition({
			type: AppContainerActions.State.APP_CONTAINER_DONE,
		});
	};
}

export function doAppContainerHideRegion(regionName: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(hideRegion(regionName));
		transition({
			type: AppContainerActions.State.APP_CONTAINER_DONE,
		});
	};
}
function updateLayoutType(layoutType: string) {
	return {
		type: AppContainerActions.UpdatelayoutType,
		layoutType,
	}
}

export function doAppContainerChangeLayout(layoutType: string) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(updateLayoutType(layoutType));
		transition({
			type: AppContainerActions.State.APP_CONTAINER_DONE,
		});

	}
}

export function doAppContainerUpdateSchema(appSchema: {}, rootContainerElements: []) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch({
			type: AppContainerActions.UpdateAppSchema,
			appSchema,
		});
		transition({
			type: AppContainerActions.State.APP_CONTAINER_READY,
			...rootContainerElements && rootContainerElements.length > 0 && { rootContainerElements },
		});
	};
}
