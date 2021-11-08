import { getDefaultRegistry, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React from "react";
import { AppStateActions, doAppGetState, doAppStateInit, doAppStateUpdate, doPropDefsInit, doRolesInit } from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

class AppState extends React.Component {
	componentWillMount() {
		const { extraParams } = this._getControlSchemaProperties();
		this.props.transition({
			type: AppStateActions.State.FV_APPSTATE_INIT,
			extraParams
		});
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAppStateInit: (evt) => dispatch(doAppStateInit(evt)),
		onAppStateGet: (evt) => dispatch(doAppGetState(evt.onData)),
		onAppStateUpdate: (evt) => dispatch(doAppStateUpdate(evt.params)),
		onPropDefsInit: (evt) => dispatch(doPropDefsInit()),
		onRolesInit: (evt) => dispatch(doRolesInit())
	};
};

const FVAppState = withReducer("FVAppState", reducer, mapDispatchToProps, stateJSON)(AppState);
FVAppState.displayName = "FVAppState";

WidgetsFactory.instance.registerFactory(FVAppState);
WidgetsFactory.instance.registerControls({
	fvAppState: "FVAppState",
	"itsy:appstate":"FVAppState"
});
