import { ICustomStateMachineData, ICustomStateMachineProvider, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");
const Actions = {
	State: {
		Form: {
			FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
			FORM_VALUE_UPDATE: "FORM_VALUE_UPDATE",
		},
		Filterbar: {
			FILTERBAR_BEFORE_CHANGE: "FILTERBAR_BEFORE_CHANGE",
		},
		Indicator: {
			HIDE_INDICATOR: "HIDE_INDICATOR",
		},
	},
};

function doFilterChange(event: any) {
	return async (_getState: any, _dispatch: any, transition: any) => {
		const { value, formValues, controlID } = event;
		transition({ type: Actions.State.Indicator.HIDE_INDICATOR });
		transition({
			type: Actions.State.Form.FORM_VALUE_UPDATE,
			values: { ...formValues, ...value },
			controlID,
			strict: true,
		});
		transition({
			controlID: `${controlID}`,
			strict: true,
			type: Actions.State.Filterbar.FILTERBAR_BEFORE_CHANGE,
			filter: { ...value },
		});
	};
}

const filterbarStateMachine: ICustomStateMachineData = {
	stateJSON: {
		states: {
			formBeforeHandleChange: {
				onEntry: [
					"onFilterChange",
				],
				on: {
					FORM_VALUE_UPDATE: "formValueUpdate",
				},
			},
		},
	},
	mapDispatchToAction: (dispatch) => {
		return {
			onFilterChange: (event) => dispatch(doFilterChange(event)),
		};
	},
};
export function initFilterOnChangeFormCustomState(contextPath: any) {
	customStateProvider.registerCustomStateMachine("FormWidget", { ...contextPath }, filterbarStateMachine);
}
