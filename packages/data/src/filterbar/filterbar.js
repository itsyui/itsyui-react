import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer, StateManagerContext } from "@itsy-ui/core";
import React, { Component } from "react";
import {
	doFilterbarBeforeInit, doFilterbarInit, doFilterbarLoad, doFilterbarBeforeChange, doFilterbarAfterChange, doFilterbarApplyFilter
	, doFilterbarAfterApplyFilter, doFilterbarBeforeReset, doFilterbarReset, doFilterbarBeforeRemoveChip, doFilterbarRemoveChip
	, doFilterbarGetState, FilterbarActions, doFilterbarUpdate,
} from "./actions";
import "./filterbarApplyFilterHandler";
import reducer from "./reducer";
import stateJSON from "./state.json";

class Filterbar extends Component {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		const { schemaId, schema, operation, applyFilterOnChange, defaultFilter, controlID } = this._getControlSchemaProperties();
		const { transition } = this.props;
		transition({
			type: FilterbarActions.State.FILTERBAR_BEFORE_INIT,
			schemaId,
			schema,
			operation,
			applyFilterOnChange,
			defaultFilter,
			controlID,
		});
	}

	onResetFilters = (event) => {
		const { controlID } = this._getControlSchemaProperties();
		const { transition } = this.props;
		transition({
			type: FilterbarActions.State.FILTERBAR_BEFORE_RESET,
			controlID,
			isHardReload: false
		});
		event.stopPropagation();
	}

	onRemoveFilter = (event, fieldKey) => {
		const { controlID } = this._getControlSchemaProperties();
		const { transition } = this.props;
		transition({
			type: FilterbarActions.State.FILTERBAR_BEFORE_REMOVE_CHIP,
			controlID,
			fieldKey
		});
		event.stopPropagation();
	}

	renderFilterbarUiControl = () => {
		const { applyFilterOnChange, controlID, isExpanded, defaultFilter } = this._getControlSchemaProperties();
		const { formSchema, filterContextPath, chips } = this.props;
		const filterBarUiSchema = {
			name: "filterbar-list",
			properties: {
				"ui:widget": "filterbarControl",
				formSchema,
				chips,
				applyFilterOnChange,
				filterContextPath,
				controlID,
				onResetFilters: this.onResetFilters.bind(this),
				onRemoveFilter: this.onRemoveFilter.bind(this),
				isExpanded: isExpanded,
				defaultFilter
			},
		};
		return <SchemaContainer key="filterbar-ui-widget" schema={filterBarUiSchema} />;
	}

	render() {
		const { formSchema } = this.props;
		if (formSchema && Object.keys(formSchema).length > 0) {
			return this.renderFilterbarUiControl();
		}
		return "Column Filter is not there ";
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onFilterbarBeforeInit: (event) => dispatch(doFilterbarBeforeInit(event)),
		onFilterbarInit: (event) => dispatch(doFilterbarInit(event)),
		onFilterbarLoad: (event) => dispatch(doFilterbarLoad(event)),
		onFilterbarBeforeChange: (event) => dispatch(doFilterbarBeforeChange(event)),
		onFilterbarAfterChange: (event) => dispatch(doFilterbarAfterChange(event)),
		onFilterbarApplyFilter: (event) => dispatch(doFilterbarApplyFilter(event)),
		onFilterbarAfterApplyFilter: (event) => dispatch(doFilterbarAfterApplyFilter(event)),
		onFilterbarBeforeReset: (event) => dispatch(doFilterbarBeforeReset(event)),
		onFilterbarReset: (event) => dispatch(doFilterbarReset(event)),
		onFilterbarBeforeRemoveChip: (event) => dispatch(doFilterbarBeforeRemoveChip(event)),
		onFilterbarRemoveChip: (event) => dispatch(doFilterbarRemoveChip(event)),
		onFilterbarGetState: (event) => dispatch(doFilterbarGetState(event)),
		onfilterbarUpdate: (event) => dispatch(doFilterbarUpdate(event))
	};
};

const FilterbarC = withReducer("Filterbar", reducer, mapDispatchToProps, stateJSON)(Filterbar);
FilterbarC.displayName = "Filterbar";
WidgetsFactory.instance.registerFactory(FilterbarC);
WidgetsFactory.instance.registerControls({
	"filterbar": "Filterbar",
});

export default FilterbarC;