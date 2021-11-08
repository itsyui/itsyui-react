import * as React from "react";
import { IWidgetControlProps, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { ILoadingOverlayStateProps, ILoadingOverlayStateTransitionProps } from "../feedback";

const Actions = {
	State: {
		Indicator: {
			SHOW_INDICATOR: "SHOW_INDICATOR",
			HIDE_INDICATOR: "HIDE_INDICATOR",
			UPDATE_INDICATOR: "UPDATE_INDICATOR",
		},
		DONE: "APPC_DONE",
	},
	IsLoadingOn: "AppActions.IsLoadingOn",
	IsLoadingOff: "AppActions.IsLoadingOff",
	UpdateLoadingMessage: "AppActions.UpdateLoadingMessage",
};

const initialState = {
	isLoading: false,
	loadingMessage: "",
};

function reducer(state: any, action: any) {
	switch (action.type) {
		case Actions.IsLoadingOn:
			return {
				...state,
				isLoading: true,
				loadingMessage: action.loadingMessage,
			};
		case Actions.IsLoadingOff:
			return {
				...state,
				isLoading: false,
				loadingMessage: "",
			};
		case Actions.UpdateLoadingMessage:
			return {
				...state,
				loadingMessage: action.loadingMessage,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

function doShowLoadingIndicator(loadingMessage: string) {
	return (_, dispatch, _transition) => {
		dispatch({
			type: Actions.IsLoadingOn,
			loadingMessage: loadingMessage,
		});
	};
}

function hideLoadingIndicator() {
	return {
		type: Actions.IsLoadingOff,
	};
}

function doHideLoadingIndicator() {
	return (_, dispatch, transition) => {
		dispatch(hideLoadingIndicator());
		transition({
			type: Actions.State.DONE,
		});
	};
}

function updateLoadingMessage(loadingMessage: string) {
	return {
		type: Actions.UpdateLoadingMessage,
		loadingMessage,
	};
}

function doUpdateLoadingIndicatorMessage(loadingMessage: string) {
	return (_, dispatch, transition) => {
		dispatch(updateLoadingMessage(loadingMessage));
		transition({
			type: Actions.State.DONE,
		});
	};
}

const stateJSON = {
	"initial": "onLoaded",
	"states": {
		"onLoaded": {
			"on": {
				"SHOW_INDICATOR": "showLoadingIndicator",
			},
		},
		"showLoadingIndicator": {
			"onEntry": [
				"onShowLoadingIndicator",
			],
			"on": {
				"HIDE_INDICATOR": "hideLoadingIndicator",
				"UPDATE_INDICATOR": "updateLoadingIndicator",
			},
		},
		"hideLoadingIndicator": {
			"onEntry": [
				"onHideLoadingIndicator",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
		"updateLoadingIndicator": {
			"onEntry": [
				"onUpdateLoadingIndicator",
			],
			"on": {
				"HIDE_INDICATOR": "hideLoadingIndicator",
				"UPDATE_INDICATOR": "updateLoadingIndicator",
			},
		},
	},
};

type LoadingOverlayProps = ILoadingOverlayStateProps & ILoadingOverlayStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
const pattern = /[{{}}]/g;
class ItsyLoadingOverlay extends React.Component<LoadingOverlayProps, {}> {

	componentWillMount() {
		if (this.props.transition && this.props.schema) {
			const { loadingMessage } = this.props.schema;
			const event = {
				type: Actions.State.Indicator.SHOW_INDICATOR,
				loadingMessage: !loadingMessage ? "" : loadingMessage
			}
			this.props.onShowLoadingIndicator(event);
		}
	}

	_getLoadingOverlayControlSchema() {
		const { loadingMessage } = this.props;
		const localeLoadingMgs = loadingMessage.match(pattern) !== null ? localeMsg.getLocaleData(loadingMessage.substring(2, loadingMessage.length - 2)) : loadingMessage;
		const loadingOverlayControlSchema = {
			name: `loadingOverlay-ui-control`,
			properties: {
				"ui:widget": "loadingOverlay_control",
				isLoading: this.props.isLoading,
				loadingMessage: localeLoadingMgs,
				className: this.props.className,
				style: this.props.style
			},
		};

		return <SchemaContainer schema={loadingOverlayControlSchema} />;
	}

	render() {
		return this._getLoadingOverlayControlSchema();
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onShowLoadingIndicator: (event) => dispatch(doShowLoadingIndicator(event.loadingMessage)),
		onHideLoadingIndicator: () => dispatch(doHideLoadingIndicator()),
		onUpdateLoadingIndicator: (event) => dispatch(doUpdateLoadingIndicatorMessage(event.loadingMessage)),
	};
};

export default withReducer("LoadingOverlay", reducer, mapDispatchToProps, stateJSON)(ItsyLoadingOverlay);
