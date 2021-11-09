import { getLocaleString, IWidgetControlProps, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { ISidebarWidgetDispatchProps, ISidebarWidgetStateTransitionProps, ISiderbarStateProps } from "../navigation";
import * as React from "react";
import { doSelectSidebarMenuKey, doSidebarCommandExecute, doSidebarInit, doSidebarRefresh, doSidebarSelectedItem, doSidebarToggle, SideBarActions } from "./actions";
import reducer from "./reducer";
import "./SidebarSchemaLoader";

import stateJSON from "./state.json";

type SidebarWidgetProps = ISiderbarStateProps & ISidebarWidgetDispatchProps & ISidebarWidgetStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;;

class SidebarWidget extends React.Component<SidebarWidgetProps, {}> {

	componentWillMount() {
		if (this.props.transition && this.props.schema) {
			const { data } = this.props.schema;
			this.props.transition({
				type: SideBarActions.States.SIDEBAR_INIT,
				data,
			});
		}
	}

	keySelected(a: any) {
		if (a !== undefined) {
			this.props.selectSidebarMenuKey(a);
		}
	}

	generateLocaleString(data: any) {
		return data.map(t => {
			if (t.hasOwnProperty("children")) {
				this.generateLocaleString(t.children);
			}
			t["title"] = getLocaleString(t, "title");
			return t;
		});
	}

	_getSidebarUIControlSchema() {
		const { layout } = this.props.schema;
		const sidebarUIControlSchema = {
			name: `sidebar-ui-control`,
			properties: {
				"ui:widget": "sidebar_control",
				data: this.generateLocaleString(JSON.parse(JSON.stringify(this.props.data))),
				keySelected: this.keySelected.bind(this),
				selectedKey: this.props.selectedKey,
				isExpand: this.props.isExpand,
				className: this.props.className,
				style: this.props.style
			},
		};
		if (layout) {
			sidebarUIControlSchema.properties["layout"] = layout;
		}
		return <SchemaContainer schema={sidebarUIControlSchema} />;
	}

	render() {
		if (this.props.data && this.props.data !== null && this.props.data.length > 0) {
			return this._getSidebarUIControlSchema()
		}
		return null;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onSidebarInit: (event) => dispatch(doSidebarInit(event.data)),
		onSidebarRefresh: (event) => dispatch(doSidebarRefresh(event.sidebarId, event.items)),
		selectSidebarMenuKey: (data) => dispatch(doSelectSidebarMenuKey(data)),
		onSidebarCommandExecute: (event) => dispatch(doSidebarCommandExecute(event.sidebarId)),
		onSidebarSelectedItem: (event) => dispatch(doSidebarSelectedItem(event.selectedItem)),
		onSidebarToggle: (event) => dispatch(doSidebarToggle(event)),
	};
};

const ItsySidebar = withReducer("SidebarWidget", reducer, mapDispatchToProps, stateJSON)(SidebarWidget);
ItsySidebar.displayName = "SidebarWidget";

WidgetsFactory.instance.registerFactory(ItsySidebar);
WidgetsFactory.instance.registerControls({
	sidebar: "SidebarWidget",
	"itsy:sidebar": "SidebarWidget"
});

export default ItsySidebar;
