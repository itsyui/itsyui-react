export const SearchAction = {
	State: {
		SEARCH_CLICKED: "SEARCH_CLICKED",
		SEARCH_LOAD: "SEARCH_LOAD",
		SEARCH_LOAD_DONE: "SEARCH_LOAD_DONE",
		SEARCH_INIT_LOADED: "SEARCH_INIT_LOADED",
		SHOW_SEARCH: "SHOW_SEARCH",
		SHOW_SEARCH_DONE: "SHOW_SEARCH_DONE",
		SEARCH_INIT: "SEARCH_INIT",
		SEARCH_AFTER_CLICKED: "SEARCH_AFTER_CLICKED",
		SEARCH_UPDATE_VALUE: "SEARCH_UPDATE_VALUE"
	},
	storeSearch: "storeSearch",
	updateSearchValue: "updateSearchValue",
};

export function doSearchClicked(value: any) {
	return async (_, dispatch: any, transition: any, _params: any) => {
		dispatch(updateSearchValue(value));
		transition({
			type: SearchAction.State.SEARCH_LOAD,
			data: value,
		});
	};
}

function storeSearch(value: any) {
	return {
		type: SearchAction.storeSearch,
		value,
	};
}

export function doSearchLoad() {
	return async (_, _dispatch: any, transition: any, _params: any) => {
		transition({
			type: SearchAction.State.SEARCH_LOAD_DONE,
		});
	};
}

export function doSearchInit(data) {
	const { typeId, schemaId, designerMetadata, controlID, enableQRScan } = data;
	const searchSchema = {
		"name": "grid_search",
		"region": "grid_search",
		"properties": {
			"ui:widget": "grid_search",
			enableQRScan,
			placeholder: "{{common.search}}",
			typeId,
			schemaId,
			designerMetadata,
			...controlID && { controlID },
		},
	};
	return async (_, _dispatch: any, transition: any, _params: any) => {
		transition({
			type: SearchAction.State.SEARCH_INIT_LOADED,
			data: searchSchema,
		});
	};
}

export function doSearchInitLoaded(value: any) {
	return async (_, dispatch: any, transition: any, _params: any) => {
		dispatch(storeSearch(value));
		transition({
			type: SearchAction.State.SHOW_SEARCH,
		});
	};
}

function updateSearchValue(searchValue) {
	return {
		type: SearchAction.updateSearchValue,
		searchValue
	};
}

export function doUpdateSearchValue(value: any) {
	return async (_, dispatch: any, transition: any, _params: any) => {
		dispatch(updateSearchValue(value));
		transition({
			type: SearchAction.State.SEARCH_LOAD_DONE,
		});
	};
}
export function doSearchWithQR() {
	return async (getStata: any, dispatch: any, transition: any, _params: any) => {
		const { data } = getStata();
		const { controlID } = data.properties;
		transition({
			type: SearchAction.State.SEARCH_LOAD_DONE,
		});
		transition({
			type: "MOBILE_SCAN_QR", onData: (scannedValue) => {
				dispatch(updateSearchValue(scannedValue));
				transition({
					...controlID && {
						controlID,
						strict: true,
					},
					type: "SEARCH_CLICKED",
					data: scannedValue,
				});
			}
		})
	};
}