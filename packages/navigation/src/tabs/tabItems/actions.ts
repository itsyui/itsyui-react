/* eslint-disable */
export const TabItemsActions = {
	State: {
		TABITEMS_INIT: "TABITEMS_INIT",
		TABITEMS_LOADED: "TABITEMS_LOADED",
	},
	Actions: {
		LoadData: "TabItemsActions.LoadData",
	},
};

export function doTabItemsInit(event: any) {
	return (_getState, dispatch, transition) => {
		dispatch(loadData(event.activeItem, event.items));
		transition({
			type: TabItemsActions.State.TABITEMS_LOADED,
		});
	};
}

function loadData(key: any, data: any) {
	return {
		type: TabItemsActions.Actions.LoadData,
		activeKey: key,
		data: data,
	};
}
