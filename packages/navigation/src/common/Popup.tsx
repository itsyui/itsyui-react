import { IWidgetControlProps, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { IPopupStateProps, IPopupStateTransitionProps } from "../navigation";
import * as React from "react";
import { isFunction, getlocaleText } from "@itsy-ui/utils";
import "./locale";

const Actions = {
	State: {
		Popup: {
			SHOW_POPUP: "SHOW_POPUP",
			HIDE_POPUP: "HIDE_POPUP",
		},
		DONE: "APPC_DONE",
	},
	ShowPopup: "AppActions.ShowPopup",
	HidePopup: "AppActions.HidePopup",
};

function doShowPopup(action: any) {
	return {
		type: Actions.ShowPopup,
		popupMessage: action.popupMessage,
		popupType: action.popupType,
		onOk: action.onOk,
		onCancel: action.onCancel,
		showCloseButton: action.showCloseButton,
		title: action.title,
	};
}

function hidePopup() {
	return {
		type: Actions.HidePopup,
	};
}

function doHidePopup() {
	return (_, dispatch, transition) => {
		dispatch(hidePopup());
		transition({
			type: Actions.State.DONE,
		});
	};
}

const initialState = {
	popupDetails: {
		isShowPopup: false,
	},
	customState: null,
};

function reducer(state: any, action: any) {
	switch (action.type) {
		case Actions.ShowPopup:
			return {
				...state,
				popupDetails: {
					...state.popupDetails,
					isShowPopup: true,
					popupMessage: action.popupMessage,
					onOk: action.onOk,
					onCancel: action.onCancel,
					popupType: action.popupType,
					showCloseButton: action.showCloseButton,
					title: action.title,
				},
			};
		case Actions.HidePopup:
			return {
				...state,
				popupDetails: {
					isShowPopup: false,
				},
				customState: null,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

const stateJSON = {
	"initial": "onLoaded",
	"states": {
		"onLoaded": {
			"on": {
				"SHOW_POPUP": "showPopup",
			},
		},
		"showPopup": {
			"onEntry": [
				"onShowPopup",
			],
			"on": {
				"HIDE_POPUP": "hidePopup",
			},
		},
		"hidePopup": {
			"onEntry": [
				"onHidePopup",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
	},
};

type PopupProps = IPopupStateProps & IPopupStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
const pattern = /[{{}}]/g;

class ItsyPopup extends React.Component<PopupProps, {}> {

	componentWillMount() {
		if (this.props.schema) {
			const { popupMessage, popupType, onOk, onCancel, showCloseButton, title } = this.props.schema;
			const eventData: any = {
				popupMessage: popupMessage,
				popupType: popupType,
				onOk: onOk,
				onCancel: onCancel,
				showCloseButton: showCloseButton,
				title: title,
			};
			this.props.transition({ type: "SHOW_POPUP", event: eventData });
		}
	}


	_handleOk = () => {
		if (!isFunction(this.props.popupDetails.onOk)) {
			if (this.props.transition) {
				this.props.transition(this.props.popupDetails.onOk);
			}
		} else {
			this.props.popupDetails.onOk.call(this);
		}
	}

	_handleCancel = () => {
		if (!isFunction(this.props.popupDetails.onCancel)) {
			if (this.props.transition) {
				this.props.transition(this.props.popupDetails.onCancel);
			}
		} else {
			this.props.popupDetails.onCancel.call(this);
		}
	}

	_getPopupControlSchema() {
		const { popupDetails } = this.props;
		const popupType = popupDetails !== undefined ? popupDetails.popupType : 1;
		const popupControlSchema = {
			name: `popup-ui-control`,
			properties: {
				"ui:widget": "popup_control",
				title: popupDetails.title ? popupDetails.title : popupType === 2 ? getlocaleText("{{app.confirm}}") : getlocaleText("{{app.alert}}"),
				visible: popupDetails !== null ? popupDetails.isShowPopup : false,
				closable: popupDetails.showCloseButton !== undefined ? popupDetails.showCloseButton : false,
				popupType: popupType,
				popupMessage: getlocaleText(popupDetails.popupMessage),
				onOkPopup: this._handleOk.bind(this),
				onCancelPopup: this._handleCancel.bind(this),
				okText: getlocaleText("{{app.Ok}}"),
				cancelText: getlocaleText("{{app.Cancel}}"),
				className: this.props.className,
				style: this.props.style
			},
		};

		return <SchemaContainer schema={popupControlSchema} />;
	}

	render() {
		const { popupDetails } = this.props;
		if (popupDetails === undefined || popupDetails !== null && !popupDetails.isShowPopup) {
			return null;
		}
		return (
			<StateManagerContext.Provider key="popup-sm-context" value={this.props.customState}>
				{this._getPopupControlSchema()}
			</StateManagerContext.Provider>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onShowPopup: ({ event }) => dispatch(doShowPopup(event)),
		onHidePopup: () => dispatch(doHidePopup()),
	};
};

const ItsyPopupWidget = withReducer("AppPopup", reducer, mapDispatchToProps, stateJSON)(ItsyPopup);
ItsyPopupWidget.displayName = "AppPopup";

WidgetsFactory.instance.registerFactory(ItsyPopupWidget);
WidgetsFactory.instance.registerControls({
	AppPopup: "AppPopup",
	"itsy:popup": "AppPopup"
});

export default ItsyPopupWidget;
