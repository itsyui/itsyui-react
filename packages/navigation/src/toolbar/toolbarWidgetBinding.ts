import { ICustomStateMachineData, WidgetsFactory } from "@itsy-ui/core";
import { IPageBindProvider } from "@itsy-ui/core";
import { RegExPatterns, getSubscriberWidgetControlId } from "@itsy-ui/utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const pageBindProvider: IPageBindProvider = dataLoader.getLoader("pageBindProvider");

const Actions = {
	State: {
		Toolbar: {
			TOOLBAR_REFRESH: "TOOLBAR_REFRESH",
		},
		Grid: {
			GRID_SELECTED_ROWS_DONE: "GRID_SELECTED_ROWS_DONE",
		},
		Page: {
			PAGE_GET_STATE: "PAGE_GET_STATE",
		}
	},
	Features: {
		UpdateToolbarContextFromGrid: "updateToolbarContextFromGrid",
	},
};

function doListForwardGridSelectedRows(event: any, currentPage: any) {
	return async (_getState, _dispatch, transition) => {
		const { selectedRows, controlID } = event;
		let subscribeWidgetControlID;
		if (controlID.match(RegExPatterns.GUID)) {
			subscribeWidgetControlID = getSubscriberWidgetControlId(currentPage, controlID, Actions.Features.UpdateToolbarContextFromGrid);
		}

		transition({ // transition toolbar_refresh
			type: Actions.State.Toolbar.TOOLBAR_REFRESH,
			...subscribeWidgetControlID && { controlID: subscribeWidgetControlID },
			items: [],
			params: {
				// this is the path to retrieve from command manager
				contextPath: {},
				// this is the context for toolbar
				context: {
					controlID,
					selectedRecords: selectedRows,
				},
			},
		});

		// end grid transition for it to return to its state
		transition({
			type: Actions.State.Grid.GRID_SELECTED_ROWS_DONE,
			controlID: controlID,
			selectedRows: selectedRows,
		});
	};
}

const updateToolbarContextFromGridStateMachine = (currentPage) => {
	const listGridStateMachine: ICustomStateMachineData = {
		name: "toolbarContextFromGrid",
		stateJSON: {
			"states": {
				"gridSelectedRows": {
					"onEntry": [
						"onListForwardGridSelectedRows",
					],
					"on": {
						"GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onListForwardGridSelectedRows: (event) => dispatch(doListForwardGridSelectedRows(event, currentPage)),
			};
		},
	};

	return listGridStateMachine;
};

pageBindProvider.putSchema("GridWidget", Actions.Features.UpdateToolbarContextFromGrid, updateToolbarContextFromGridStateMachine);
