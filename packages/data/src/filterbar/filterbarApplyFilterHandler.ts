import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");
const Actions = {
	State: {
		Form: {
			FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",

		},
		Filterbar: {
			FILTERBAR_APPLY_FILTER: "FILTERBAR_APPLY_FILTER",
		},
		Indicator: {
			HIDE_INDICATOR: "HIDE_INDICATOR",
		},
	},
};

function doFormApplyFilter(event: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		const { values, controlID } = event;
		transition({ type: Actions.State.Indicator.HIDE_INDICATOR });
		transition({
			controlID: `${controlID}`,
			strict: true,
			type: Actions.State.Form.FORM_AFTER_SUBMIT,
		});
		transition({
			controlID: `${controlID}`,
			strict: true,
			type: Actions.State.Filterbar.FILTERBAR_APPLY_FILTER,
			filters: values,
		});
	};
}

const filterbarStateMachine: ICustomStateMachineData = {
	stateJSON: {
		states: {
			onLoaded: {
				on: {
					FORM_VALUE_UPDATE: "formValueUpdate",
				},
			},
			formSubmit: {
				onEntry: [
					"onFormApplyFilter",
				],
				on: {
					FORM_AFTER_SUBMIT: "formAfterSubmit",
					FORM_ERROR: "formError",
				},
			},
		},
	},
	mapDispatchToAction: (dispatch) => {
		return {
			onFormApplyFilter: (event) => dispatch(doFormApplyFilter(event)),
		};
	},
};
export function initApplyFilterFormCustomState(contextPath: any) {
	customStateProvider.registerCustomStateMachine("FormWidget", { ...contextPath }, filterbarStateMachine);
}
