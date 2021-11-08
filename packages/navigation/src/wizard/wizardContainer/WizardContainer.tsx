import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
//import { IWizardStateTransitionProps, IWizardWidgetDispatchProps, IWizardWidgetStateProps } from "../../types/wizard";
import {
	doWizardFinalStepSubmit, doWizardGetState, doWizardStateUpdate, doWizardStepAfterInit, doWizardStepBeforeInit, doWizardStepInit,
	doWizardStepOnNext, doWizardStepOnPrevious, onLoadProperties
} from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

//type WizardContainerProps = IWizardWidgetDispatchProps & IWizardStateTransitionProps & IWizardWidgetStateProps & IWidgetControlProps;

class WizardContainer extends React.Component<any, {}> {

	componentWillMount() {
		const { typeId, schemaId, stepControlSchema, extraParams } = this._getControlSchemaProperties();
		this.props.loadProperties(typeId, schemaId, stepControlSchema, extraParams);
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_onNextClick() {
		this.props.transition(this.props.currentStepContentSchema.onNextTransition);
	}

	_onPreviousClick() {
		this.props.transition(this.props.currentStepContentSchema.onPreviousTransition);
	}

	_onFinalButtonClick() {
		this.props.transition(this.props.currentStepContentSchema.onFinalSubmitTransition);
	}
	_onStepClick(data: any) {
		const stepCount = data.id.split("-")[1];
		this.props.transition({
			type: `WIZARD_BEFORE_STEP_${stepCount}_INIT`,
			stepCount,
		});
	}

	render() {
		if (this.props.stepControlSchema !== undefined && Object.keys(this.props.stepControlSchema).length > 0) {
			const stepWizardUIControlSchema = {
				name: `step-wizard-ui-control-${this.props.typeId}`,
				properties: {
					"ui:widget": "stepwizard",
					"currentStep": this.props.currentStep,
					"typeId": this.props.typeId,
					"schemaId": this.props.schemaId,
					"stepControlSchema": this.props.stepControlSchema,
					"currentStepContentSchema": this.props.currentStepContentSchema.controlSchema,
					"onNext": this._onNextClick.bind(this),
					"onPrevious": this._onPreviousClick.bind(this),
					"onFinalStepSubmit": this._onFinalButtonClick.bind(this),
					"onStepClick": this._onStepClick.bind(this),
				},
			};
			return <SchemaContainer schema={stepWizardUIControlSchema} />;
		} else {
			return <label>loading...</label>;
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		loadProperties: (typeId, schemaId, stepControlSchema, extraParams) => dispatch(onLoadProperties(typeId, schemaId, stepControlSchema, extraParams)),
		onWizardStepBeforeInit: (event) => dispatch(doWizardStepBeforeInit(event)),
		onWizardStepInit: (event) => dispatch(doWizardStepInit(event)),
		onWizardStepAfterInit: (event) => dispatch(doWizardStepAfterInit(event.currentStepContentSchema)),
		onWizardStepOnNext: () => dispatch(doWizardStepOnNext()),
		onWizardStepOnPrevious: () => dispatch(doWizardStepOnPrevious()),
		onWizardStateUpdate: (event) => dispatch(doWizardStateUpdate(event)),
		onWizardFinalStepSubmit: (event) => dispatch(doWizardFinalStepSubmit(event)),
		onWizardGetState: (event) => dispatch(doWizardGetState(event.onData))
	};
};

const WizardContainerC = withReducer("WizardContainer", reducer, mapDispatchToProps, stateJSON)(WizardContainer);
WizardContainerC.displayName = "WizardContainer";

WidgetsFactory.instance.registerFactory(WizardContainerC);
WidgetsFactory.instance.registerControls({
	wizard_container: "WizardContainer",
});
