import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory, DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");

function doMasterGridSelectedRowsDone(evt: any) {
    return (getState: any, dispatch: any, transition: any) => {
        const selectedRows = evt.selectedRows;
        transition({
            type: "GRID_SELECTED_ROWS_DONE",
            controlID: "master_details",
            strict: true,
            selectedRows: selectedRows,
        });
        transition({
            type: "NAVIGATE_URL",
            url: `/details?id=${selectedRows[0].id}`,
        });
    };
}

const tabsGrid: ICustomStateMachineData = {
    stateJSON: {
        "states": {
            "gridSelectedRows": {
                "onEntry": [
                    "onMasterGridSelectedRowsDone",
                ],
                "on": {
                    "GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
                },
            },
        },
    },
    mapDispatchToAction: (dispatch: any) => {
        return {
            onMasterGridSelectedRowsDone: (evt: any) => dispatch(doMasterGridSelectedRowsDone(evt)),
        };
    },
};

customStateProvider.registerCustomStateMachine("GridWidget", { "id": "master_details" }, tabsGrid);
