import { ICustomStateMachineData, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IPageBindProvider } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const pageBindProvider: IPageBindProvider = dataLoader.getLoader("pageBindProvider");

export const getSubscribers = (currentPage: any, providerControlId: any, feature: any) => {
	if (currentPage && providerControlId && feature) {
		let searchSubscribers = Object.keys(currentPage.pageBinding).filter(t => Object.keys(currentPage.pageBinding[t]).find(x => currentPage.pageBinding[t][x].name === feature));
		searchSubscribers = searchSubscribers.filter(t => currentPage.pageBinding[t] && Object.keys(currentPage.pageBinding[t]).find(x => currentPage.pageBinding[t][x].providerId === providerControlId));
		return searchSubscribers;
	}
	return [];
};

const Actions = {
	Grid: {
		GRID_FILTER: "GRID_FILTER",
	},
	Page: {
		PAGE_GET_STATE: "PAGE_GET_STATE",
	},
	Features: {
		Search: "search",
	}
}

function doSearchCustomState(event: any, currentPage: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		const { data, controlID } = event;
		const subscribeWidgetControlIDs = getSubscribers(currentPage, controlID, Actions.Features.Search);

		if (subscribeWidgetControlIDs && Array.isArray(subscribeWidgetControlIDs)) {
			subscribeWidgetControlIDs.forEach(t => {
				transition({
					controlID: t,
					strict: true,
					type: "GRID_FILTER",
					searchValue: data,
				});
			});
		}
		transition({
			controlID,
			strict: true,
			type: "SEARCH_LOAD_DONE",
		});
	};
}
const getSearchStateMachine = (currentPage) => {
	const searchStateMachine: ICustomStateMachineData = {
		name: "searchStateMachine",
		stateJSON: {
			"states": {
				"searchLoad": {
					"onEntry": [
						"onSearchCustomState",
					],
					"on": {
						"SEARCH_LOAD_DONE": "onLoaded",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onSearchCustomState: (event) => dispatch(doSearchCustomState(event, currentPage)),
			};
		},
	};

	return searchStateMachine;
};


pageBindProvider.putSchema("SearchWidget", "search", getSearchStateMachine);
