import { getLocaleString, IWidgetControlProps, SchemaContainer, StateManagerContext, withReducer, WidgetsFactory } from "@itsy-ui/core";
import { IModalStateProps, IModalStateTransitionProps, IShowModalEventArgs } from "../navigation";
import * as React from "react";
import { isFunction, getlocaleText } from "@itsy-ui/utils";
import "./locale";

const Actions = {
	State: {
		Modal: {
			SHOW_MODAL: "SHOW_MODAL",
			HIDE_MODAL: "HIDE_MODAL",
		},
		DONE: "APPC_DONE",
	},
	ShowModal: "AppActions.ShowModal",
	HideModal: "AppActions.HideModal",
};

function doShowModal(action: any) {
	action.controlSchema.properties.isModal = true;
	return {
		type: Actions.ShowModal,
		title: action.title,
		controlSchema: action.controlSchema,
		okText: action.okText,
		cancelText: action.cancelText,
		onOKTransition: action.onOKTransition,
		onCancelTransition: action.onCancelTransition,
		showOKButton: action.showOKButton,
		showCancelButton: action.showCancelButton,
		showCloseButton: action.showCloseButton,
		customState: action.customState,
		width: action.width,
		onOk: action.onOk,
		onCancel: action.onCancel,
	};
}

function hideModal() {
	return {
		type: Actions.HideModal,
	};
}

function doHideModal() {
	return (_, dispatch, transition) => {
		dispatch(hideModal());
		transition({
			type: Actions.State.DONE,
		});
	};
}

const initialState = {
	modalData: {
		isShowModal: false,
	},
	customState: null,
};

function reducer(state: any, action: any) {
	switch (action.type) {
		case Actions.ShowModal:
			return {
				...state,
				modalData: {
					...state.modalData,
					isShowModal: true,
					title: action.title,
					okText: action.okText,
					cancelText: action.cancelText,
					controlSchema: action.controlSchema,
					onOKTransition: action.onOKTransition,
					onCancelTransition: action.onCancelTransition,
					showOKButton: action.showOKButton,
					showCancelButton: action.showCancelButton,
					showCloseButton: action.showCloseButton,
					width: action.width,
					onOk: action.onOk,
					onCancel: action.onCancel,
				},
				customState: action.customState,
			};
		case Actions.HideModal:
			return {
				...state,
				modalData: {
					isShowModal: false,
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
				"SHOW_MODAL": "showModal",
			},
		},
		"showModal": {
			"onEntry": [
				"onShowModal",
			],
			"on": {
				"HIDE_MODAL": "hideModal",
			},
		},
		"hideModal": {
			"onEntry": [
				"onHideModal",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
	},
};

type ModalProps = IModalStateProps & IModalStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

class ItsyModalView extends React.Component<ModalProps, {}> {

	componentWillMount() {
		if (this.props.schema) {
			const { title, controlSchema, okText, cancelText, onOKTransition, onCancelTransition,
				showOKButton, showCancelButton, showCloseButton, customState, width, onOk, onCancel
			} = this.props.schema;
			if (controlSchema && controlSchema !== {}) {
				const eventData: any = {
					title: title,
					controlSchema: controlSchema,
					okText: okText,
					cancelText: cancelText,
					onOKTransition: onOKTransition,
					onCancelTransition: onCancelTransition,
					showOKButton: showOKButton,
					showCancelButton: showCancelButton,
					showCloseButton: showCloseButton,
					customState: customState,
					width: width,
					onOk: onOk,
					onCancel: onCancel,
				}
				this.props.transition({ type: "SHOW_MODAL", event: eventData });
			}
		}
	}

	_handleOk = () => {
		const { transition, modalData } = this.props;
		const okTransition = modalData.onOKTransition !== undefined && !isFunction(modalData.onOKTransition) ? modalData.onOKTransition : "HIDE_MODAL";
		if (modalData.onOk) {
			modalData.onOk.call(this);
		} else {
			if (transition) {
				transition(okTransition);
			}
		}
	}

	_handleCancel = () => {
		const { transition, modalData } = this.props;
		const cancelTransition = modalData.onCancelTransition !== undefined && !isFunction(modalData.onCancelTransition) ? modalData.onCancelTransition : "HIDE_MODAL";
		if (modalData.onCancel) {
			modalData.onCancel.call(this);
		} else {
			if (transition) {
				transition(cancelTransition);
			}
		}
	}

	_getModalControlSchema() {
		const { modalData } = this.props;
		const { okText, cancelText, showOKButton, showCancelButton, showCloseButton } = modalData;
		const modalControlSchema = {
			name: `modal-ui-control-`,
			properties: {
				"ui:widget": "modal_control",
				title: getLocaleString(modalData, "title"),
				closable: showCloseButton !== undefined ? showCloseButton : false,
				maskClosable: false,
				width: modalData.width !== undefined ? modalData.width : 320,
				visible: modalData !== undefined ? modalData.isShowModal : false,
				controlSchema: modalData.controlSchema,
				onOkModal: this._handleOk.bind(this),
				onCancelModal: this._handleCancel.bind(this),
				okText: okText !== undefined ? okText : getlocaleText("{{app.Ok}}"),
				cancelText: cancelText !== undefined ? cancelText : getlocaleText("{{app.Cancel}}"),
				showOKButton: showOKButton !== undefined ? showOKButton : true,
				showCancelButton: showCancelButton !== undefined ? showCancelButton : true,
				className: this.props.className,
				style: this.props.style
			},
		};

		return <SchemaContainer schema={modalControlSchema} />;
	}

	render() {
		const { modalData } = this.props;
		if (modalData === undefined || modalData !== null && !modalData.isShowModal) {
			return null;
		}

		return (
			<StateManagerContext.Provider key="modal-sm-context" value={this.props.customState}>
				{this._getModalControlSchema()}
			</StateManagerContext.Provider>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onShowModal: ({ event }) => dispatch(doShowModal(event)),
		onHideModal: () => dispatch(doHideModal()),
	};
};

const ItsyModalViewWidget = withReducer("AppModal", reducer, mapDispatchToProps, stateJSON)(ItsyModalView);
ItsyModalViewWidget.displayName = "AppModal";

WidgetsFactory.instance.registerFactory(ItsyModalViewWidget);
WidgetsFactory.instance.registerControls({
	AppModal: "AppModal",
	"itsy:modal": "AppModal"
});

export default ItsyModalViewWidget;
