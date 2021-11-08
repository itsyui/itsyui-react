import { LayoutManagerWidget, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React, { Component } from "react";
import AppWidget from "../AppWidget";
import { AppShellActions, doAppBeforeLoad, doAppLoad } from "./actions";
import reducer from "./reducer";

class AppShell extends Component {

	componentWillMount() {
		this.props.transition({
			type: AppShellActions.State.APP_BEFORE_LOAD,
		});
	}

	render() {
		if (this.props.loadApp) {
			return <AppWidget key="AppWidget" />;
		} else {
			return null;
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAppBeforeLoad: (event) => dispatch(doAppBeforeLoad(event)),
		onAppLoad: (event) => dispatch(doAppLoad(event))
	};
};

export const withLayoutManager = WrappedComponent => {
	const Extended = (props) => {
		return <LayoutManagerWidget>
			<WrappedComponent {...props} />
		</LayoutManagerWidget>;
	};

	return Extended;
};

import stateJSON from "./state.json";
const AppShellC = withLayoutManager(withReducer("AppShell", reducer, mapDispatchToProps, stateJSON)(AppShell));
AppShellC.displayName = "AppShell";

WidgetsFactory.instance.registerFactory(AppShellC);
WidgetsFactory.instance.registerControls({
	appShell: "AppShell",
	"itsy:appshell": "AppShell"
});

export default AppShellC;