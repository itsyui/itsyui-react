export const WizardContainerActions = {
	State: {
		WIZARD_STEP_ON_NEXT: "WIZARD_STEP_ON_NEXT",
		WIZARD_STEP_ON_PREVIOUS: "WIZARD_STEP_ON_PREVIOUS",
		WIZARD_FINAL_STEP_SUBMIT: "WIZARD_FINAL_STEP_SUBMIT",
		WIZARD_LOADED: "WIZARD_LOADED",
		WIZARD_STATE_UPDATE_DONE: "WIZARD_STATE_UPDATE_DONE",
		WIZARD_DONE: "WIZARD_DONE",
	},
	LoadProperties: "WizardContainerActions.LoadProperties",
	UpdateCurrentStepContentSchema: "WizardContainerActions.UpdateCurrentStepContentSchema",
	UpdateStateValues: "WizardContainerActions.UpdateStateValues",
	UpdateCurrentStep: "WizardContainerActions.UpdateCurrentStep",
	OnNext: "WizardContainerActions.OnNext ",
	OnPrevious: "WizardContainerActions.OnPrevious",
};

function _loadProperties(typeId: string, schemaId: string, stepControlSchema: any, extraParams: {}) {
	return {
		type: WizardContainerActions.LoadProperties,
		typeId,
		schemaId,
		stepControlSchema,
		extraParams
	};
}

export function onLoadProperties(typeId: string, schemaId: string, stepControlSchema: any, extraParams: {}) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(_loadProperties(typeId, schemaId, stepControlSchema, extraParams));
		transition({
			type: "WIZARD_BEFORE_STEP_0_INIT",
		});
	};
}

export function doWizardStepBeforeInit(event: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { stepStore } = getState();
		let { currentStep } = getState();
		currentStep = event.stepCount ? event.stepCount : currentStep;
		transition({
			type: `WIZARD_STEP_${currentStep}_INIT`,
			stepStore: stepStore.length > 0 ? stepStore : [],
		});
	};
}

export function doWizardStepInit(_event: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { currentStep } = getState();
		transition({
			type: `WIZARD_AFTER_STEP_${currentStep}_INIT`,
		});
	};
}

function _updateCurrentStepContentSchema(currentStepContentSchema: any) {
	return {
		type: WizardContainerActions.UpdateCurrentStepContentSchema,
		currentStepContentSchema,
	};
}

export function doWizardStepAfterInit(currentStepContentSchema: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(_updateCurrentStepContentSchema(currentStepContentSchema));
		transition({
			type: WizardContainerActions.State.WIZARD_LOADED,
		});
	};
}

function currentPageInc() {
	return {
		type: WizardContainerActions.OnNext,
	};
}

export function doWizardStepOnNext() {
	return (getState: any, dispatch: any, transition: any) => {
		dispatch(currentPageInc());
		const { currentStep } = getState();
		transition({
			type: WizardContainerActions.State.WIZARD_LOADED,
		});
		transition({
			type: `WIZARD_BEFORE_STEP_${currentStep}_INIT`,
		});
	};
}

function currentPageDec() {
	return {
		type: WizardContainerActions.OnPrevious,
	};
}

export function doWizardStepOnPrevious() {
	return (getState: any, dispatch: any, transition: any) => {
		dispatch(currentPageDec());
		const { currentStep } = getState();
		transition({
			type: WizardContainerActions.State.WIZARD_LOADED,
		});
		transition({
			type: `WIZARD_BEFORE_STEP_${currentStep}_INIT`,
		});
	};
}

function updateState(data: any) {
	return {
		type: WizardContainerActions.UpdateStateValues,
		data,
	};
}

export function doWizardStateUpdate(event: any) {
	return (_getState: any, dispatch: any, transition: any) => {
		dispatch(updateState(event.values));
		transition({
			type: WizardContainerActions.State.WIZARD_STATE_UPDATE_DONE,
		});
	};
}

export function doWizardFinalStepSubmit(_event: any) {
	return (_getState: any, _dispatch: any, transition: any) => {
		transition({
			type: WizardContainerActions.State.WIZARD_DONE,
		});
	};
}
export function doWizardGetState(onData: any) {
	return (getState: any, _dispatch: any, transition: any) => {
		transition({
			type: WizardContainerActions.State.WIZARD_DONE,
		});
		const wizardState = getState();
		onData(wizardState);
	};
}
