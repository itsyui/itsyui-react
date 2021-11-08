import { getDefaultRegistry, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getUrlParams } from "@itsy-ui/utils";
import { doLoadControlSchema } from "./actions";
import reducer from "./reducer";
import "./wizardContainer/WizardContainer";
import "./stepWizardSchemaLoader";

class WizardLayout extends React.Component {
	componentWillMount() {
		if (this.props.transition || this.props.location) {
			const { queryParamsOptions } = this.getControlSchemaProperties();
			let queryParams = {};
			if (queryParamsOptions) {
				queryParams = {
					typeId: queryParamsOptions.typeId,
					schemaId: queryParamsOptions.schemaId,
					extraParams: queryParamsOptions.extraParams
				};
			} else {
				queryParams = getUrlParams(this.props.location.search);
			}
			this.typeId = queryParams.typeId;
			this.stepWizardSchemaId = queryParamsOptions !== undefined ? queryParamsOptions.stepWizardSchemaId : queryParams.stepWizardSchemaId;
			this.schemaId = queryParams.schemaId ? queryParams.schemaId : undefined;
			if (this.props.loadControlSchema) {
				const { data } = this.props.schema;
				this.props.loadControlSchema(this.typeId, this.stepWizardSchemaId ? this.stepWizardSchemaId : this.schemaId, queryParams.extraParams, data);
			}
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_getCustomState() {
		const contextPath = {
			typeId: this.typeId
		};
		if (this.stepWizardSchemaId !== undefined) {
			contextPath.stepWizardSchemaId = this.stepWizardSchemaId;
		} else if (this.schemaId) {
			contextPath.schemaId = this.schemaId;

		}

		return {
			contextPath,
		};
	}

	_getWrappedComponent(stepComponent, key, schema) {
		const emptyReducer = () => { };
		const emptyDispatchProps = () => { };
		const StepWizardC = withReducer("StepWizard", emptyReducer, emptyDispatchProps)(stepComponent);
		StepWizardC.displayName = "StepWizard";
		return <StepWizardC key={key} schema={schema} />;
	}

	render() {
		const viewEls = [];
		const wizardKey = `wizard-layout-${this.typeId}`;
		if (this.props.stepControlSchema !== undefined && Object.keys(this.props.stepControlSchema).length > 0) {
			const wizardContainerControlSchema = {
				name: `wizard-container-${this.typeId}`,
				properties: {
					"ui:widget": "wizard_container",
					"typeId": this.props.typeId,
					"schemaId": this.props.schemaId,
					"stepControlSchema": this.props.stepControlSchema,
					"extraParams": this.props.extraParams
				},
			};

			viewEls.push(<SchemaContainer schema={wizardContainerControlSchema} />);
		}

		return <StateManagerContext.Provider key={wizardKey} value={this._getCustomState()}>
			{viewEls}
		</StateManagerContext.Provider>;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		loadControlSchema: (typeId, schemaId, extraParams, data) => dispatch(doLoadControlSchema(typeId, schemaId, extraParams, data)),
	};
};

const ItsyWizardLayout = withReducer("WizardLayout", reducer, mapDispatchToProps)(WizardLayout);
ItsyWizardLayout.displayName = "WizardLayout";

WidgetsFactory.instance.registerFactory(ItsyWizardLayout);
WidgetsFactory.instance.registerControls({
	wizard: "WizardLayout",
});

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const recordRegistry = dataLoader.getLoader("LayoutRegistry");
const WizardLayoutWidget = {
	getName() {
		return "wizard";
	},
	getSchema(params) {
		return null;
	},
};

recordRegistry.registerComponentSchema("wizard", WizardLayoutWidget);

export default ItsyWizardLayout;