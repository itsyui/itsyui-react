import { getLocaleString, IWidgetControlProps, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { IDrawerStateProps, IDrawerStateTransitionProps, IShowModalEventArgs } from "../navigation";
import * as React from "react";
import { isFunction, getlocaleText } from "@itsy-ui/utils";
import "./locale";

const Actions = {
	State: {
		Drawer: {
			SHOW_DRAWER: "SHOW_DRAWER",
			HIDE_DRAWER: "HIDE_DRAWER",
		},
		DONE: "APPC_DONE",
	},
	ShowDrawer: "AppActions.ShowDrawer",
	HideDrawer: "AppActions.HideDrawer",
	ToggleSize: "AppActions.ToggleSize",
};

const initialState = {
	stackDrawerData: {
		1: {
			drawerData: { isShowDrawer: false },
			customState: null,
		},
	},
	stackDrawerLevel: 0,
};

function reducer(state: any, action: any) {
	switch (action.type) {
		case Actions.ShowDrawer:
			//const currentDrawerData = ;
			const currentDrawerData = { ...state.stackDrawerData };
			currentDrawerData[state.stackDrawerLevel + 1] = {
				drawerData: {
					isShowDrawer: true,
					title: action.title,
					width: action.width,
					fillContent: action.fillContent,
					showOK: action.showOK,
					controlSchema: action.controlSchema,
					showCancel: action.showCancel,
					okText: action.okText,
					cancelText: action.cancelText,
					onOKTransition: action.onOKTransition,
					onCancelTransition: action.onCancelTransition,
					onOk: action.onOk,
					onCancel: action.onCancel,
					showCloseButton: action.showCloseButton,
					isToggleSize: action.isToggleSize,
				},
				customState: action.customState
			}
			//const currentDrawerData = { [state.stackDrawerLevel + 1]: { drawerData, "customState": action.customState } };
			return {
				...state,
				stackDrawerData: { ...currentDrawerData },
				stackDrawerLevel: state.stackDrawerLevel + 1,
			};
		case Actions.HideDrawer:
			const drawerCount = state.stackDrawerLevel - 1;
			delete state.stackDrawerData[state.stackDrawerLevel];
			if (Object.keys(state.stackDrawerData).length === 0) {
				return {
					...state,
					stackDrawerData: { 1: { drawerData: { isShowDrawer: false }, customState: null } },
					stackDrawerLevel: 0,
				};
			} else {
				return {
					...state,
					stackDrawerData: Object.assign(state.stackDrawerData),
					stackDrawerLevel: drawerCount,
				};
			}
		case Actions.ToggleSize:
			let currentDrawer = { ...state.stackDrawerData[state.stackDrawerLevel] };
			currentDrawer = { ...currentDrawer, ...{ drawerData: { ...currentDrawer.drawerData, ...{ isExpand: action.isExpand } } } };
			return {
				...state,
				stackDrawerData: { ...state.stackDrawerData, ...{ [state.stackDrawerLevel]: currentDrawer } },
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

function doShowDrawer(action: any) {
	return (_, dispatch, transition) => {
		action.controlSchema.properties.isModal = true;
		dispatch({
			type: Actions.ShowDrawer,
			title: action.title,
			width: action.width,
			fillContent: action.fillContent,
			showOK: action.showOK,
			controlSchema: action.controlSchema,
			showCancel: action.showCancel,
			okText: action.okText,
			cancelText: action.cancelText,
			onOKTransition: action.onOKTransition,
			onCancelTransition: action.onCancelTransition,
			customState: action.customState,
			onOk: action.onOk,
			onCancel: action.onCancel,
			showCloseButton: action.showCloseButton,
			isToggleSize: action.isToggleSize,
		});
		transition({ type: Actions.State.DONE });
	};
}

function hideDrawer() {
	return {
		type: Actions.HideDrawer,
	};
}

function doHideDrawer() {
	return (_, dispatch, transition) => {
		dispatch(hideDrawer());
		transition({
			type: Actions.State.DONE,
		});
	};
}
function doDrawerGetState(onData: any) {
	return (getState, _dispatch, transition) => {
		transition({
			type: Actions.State.DONE,
		});
		const drawerState = getState();
		onData.call(null, drawerState);
	};
}

function doToggleSize() {
	return (getState, dispatch, _transition) => {
		const drawerState = getState();
		const { stackDrawerData, stackDrawerLevel } = drawerState;
		const { drawerData } = stackDrawerData[stackDrawerLevel];
		const { isExpand, fillContent } = drawerData;
		const expandToggle = isExpand !== undefined && isExpand !== null ? isExpand : fillContent ? fillContent : false;
		dispatch({
			type: Actions.ToggleSize,
			isExpand: !expandToggle,
		});
	};
}

const stateJSON = {
	"initial": "onLoaded",
	"states": {
		"onLoaded": {
			"on": {
				"SHOW_DRAWER": "showDrawer",
				"HIDE_DRAWER": "hideDrawer",
				"DRAWER_GET_STATE": "drawerGetState",
			},
		},
		"showDrawer": {
			"onEntry": [
				"onShowDrawer",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
		"hideDrawer": {
			"onEntry": [
				"onHideDrawer",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
		"drawerGetState": {
			"onEntry": [
				"onDrawerGetState",
			],
			"on": {
				"APPC_DONE": "onLoaded",
			},
		},
	},
};

type DrawerProps = IDrawerStateProps & IDrawerStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

class DrawerView extends React.Component<DrawerProps, {}> {

	componentWillMount() {
		if (this.props.schema) {
			const { title, width, controlSchema, onCancelTransition, showOK, showCancel, fillContent,
				okText, cancelText, onOKTransition, customState, onOk, onCancel, showCloseButton, isToggleSize
			} = this.props.schema;
			if (controlSchema && controlSchema !== {}) {
				const eventData: any = {
					title: title,
					width: fillContent !== undefined && fillContent ? window.innerWidth : width !== undefined ? width : 150,
					controlSchema: controlSchema,
					onCancelTransition: onCancelTransition,
					type: Actions.ShowDrawer,
					fillContent: fillContent,
					showOK: showOK,
					showCancel: showCancel,
					okText: okText,
					cancelText: cancelText,
					onOKTransition: onOKTransition,
					customState: customState,
					onOk: onOk,
					onCancel: onCancel,
					showCloseButton: showCloseButton,
					isToggleSize: isToggleSize ? isToggleSize : false,
					...isToggleSize && { isExpand: fillContent ? true : false },
				}
				this.props.onShowDrawer({ event: eventData });
			}
		}
	}

	onClose = () => {
		const { stackDrawerData, stackDrawerLevel } = this.props;
		const { drawerData } = stackDrawerData[stackDrawerLevel];
		const cancelTransition = drawerData.onCancelTransition !== undefined && !isFunction(drawerData.onCancelTransition) ? drawerData.onCancelTransition : "HIDE_DRAWER";
		if (drawerData.onCancel) {
			drawerData.onCancel.call(this);
		} else {
			if (this.props.transition) {
				this.props.transition(cancelTransition);
			}
		}
	}

	onOk = () => {
		const { stackDrawerData, stackDrawerLevel } = this.props;
		const { drawerData } = stackDrawerData[stackDrawerLevel];
		const okTransition = drawerData.onOKTransition !== undefined && !isFunction(drawerData.onOKTransition) ? drawerData.onOKTransition : "HIDE_DRAWER";
		if (drawerData.onOk) {
			drawerData.onOk.call(this);
		} else {
			if (this.props.transition) {
				this.props.transition(okTransition);
			}
		}
	}

	onToggleSize = () => {
		this.props.onToggleSize();
	}

	getDrawerUIControlSchema() {
		console.log("on getDrawerUIControlSchema");
		let viewEls = [];
		const { stackDrawerData, stackDrawerLevel } = this.props;
		viewEls = Object.keys(stackDrawerData).map(ele => {
			const { drawerData } = stackDrawerData[ele];
			const { fillContent, showOK, showCancel, okText, cancelText, showCloseButton, width, isToggleSize } = drawerData;
			const drawerWidth = fillContent ? window.innerWidth : width !== undefined ? width : 150;
			let { isExpand } = drawerData;
			if (isToggleSize) {
				isExpand = isExpand !== undefined && isExpand !== null ? isExpand : fillContent ? fillContent : false;
			}
			const drawerUIControlSchema = {
				name: `drawer-ui-control`,
				properties: {
					"ui:widget": "drawer_control",
					title: getLocaleString(drawerData, "title"),
					width: drawerWidth,
					stackDrawerLevel: stackDrawerLevel,
					// tslint:disable-next-line: radix
					hiddenDrawerStyle: { display: !(parseInt(ele) === stackDrawerLevel) ? "none" : "", zIndex: stackDrawerLevel > 1 ? stackDrawerLevel * 1000 : 1000 },
					closable: showCloseButton !== undefined ? showCloseButton : false,
					onCloseDrawer: this.onClose.bind(this),
					visible: drawerData.isShowDrawer !== undefined ? drawerData.isShowDrawer : false,
					controlSchema: drawerData.controlSchema,
					showOK: showOK !== undefined ? showOK : true,
					showCancel: showCancel !== undefined ? showCancel : true,
					okText: okText !== undefined ? okText : getlocaleText("{{app.Ok}}"),
					cancelText: cancelText !== undefined ? cancelText : getlocaleText("{{app.Cancel}}"),
					onOkDrawer: this.onOk.bind(this),
					isToggleSize: isToggleSize ? isToggleSize : false,
					...isToggleSize && {
						isExpand,
						onToggleSize: this.onToggleSize.bind(this),
						width: isExpand ? (fillContent ? drawerWidth : window.innerWidth * 90 / 100) : (fillContent ? window.innerWidth * 50 / 100 : drawerWidth),
					},
					className: this.props.className,
					style: this.props.style
				},
			};
			return <SchemaContainer key={`drawer-level-${ele}`} schema={drawerUIControlSchema} />;
		});
		return viewEls;
	}

	render() {
		const { stackDrawerData, stackDrawerLevel } = this.props;
		if (stackDrawerData[stackDrawerLevel] === undefined || stackDrawerData[stackDrawerLevel] !== null && !stackDrawerData[stackDrawerLevel].drawerData.isShowDrawer) {
			return null;
		}
		console.log(stackDrawerData);
		return (
			<StateManagerContext.Provider key="drawer-sm-context" value={stackDrawerData[stackDrawerLevel].customState}>
				{this.getDrawerUIControlSchema()}
			</StateManagerContext.Provider>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onShowDrawer: ({ event }) => dispatch(doShowDrawer(event)),
		onHideDrawer: () => dispatch(doHideDrawer()),
		onDrawerGetState: (event) => dispatch(doDrawerGetState(event.onData)),
		onToggleSize: () => dispatch(doToggleSize()),
	};
};

const ItsyDrawer = withReducer("DrawerView", reducer, mapDispatchToProps, stateJSON)(DrawerView);
ItsyDrawer.displayName = "DrawerView";

WidgetsFactory.instance.registerFactory(ItsyDrawer);
WidgetsFactory.instance.registerControls({
	AppDrawer: "DrawerView",
	'itsy:drawer': "DrawerView"
});

export default ItsyDrawer;
