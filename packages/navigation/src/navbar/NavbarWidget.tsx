import { getLocaleString, IWidgetControlProps, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { INavbarWidgetDispatchProps, INavbarWidgetStateProps, INavbarWidgetStateTransitionProps } from "../navigation";
import * as React from "react";
import { doNavbarCommandExecute, doNavbarGetState, doNavbarInit, doNavbarRefresh, doNavItemClick, NavbarActions } from "./actions";
import reducer from "./reducer";
import "./NavbarSchemaLoader";

import stateJSON from "./state.json";

type NavbarWidgetProps = INavbarWidgetStateProps & INavbarWidgetDispatchProps & INavbarWidgetStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;;

class NavbarWidget extends React.Component<NavbarWidgetProps, {}> {
	componentWillMount() {
		if (this.props.transition) {
			const { data } = this.props.schema
			this.props.transition({
				type: NavbarActions.State.NAVBAR_INIT,
				data: data,
			});
		}
	}

	_onNavItemClicked(navItemData: any) {
		this.props.navItemClick(navItemData);
	}

	generateLocaleString(data: any) {
		const items = {};
		const leftItems = data.items ? data.items.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		const rightItems = data.rightItems ? data.rightItems.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		items["items"] = leftItems;
		items["rightItems"] = rightItems;
		return items;
	}

	_getNavbarUIControlSchema() {
		const { layout } = this.props.schema;
		const navbarUIControlSchema = {
			name: `navbar-ui-control`,
			properties: {
				"ui:widget": "navbar_control",
				data: this.generateLocaleString(JSON.parse(JSON.stringify(this.props.data))),
				onItemClick: this._onNavItemClicked.bind(this),
				className: this.props.className,
				style: this.props.style
			},
		};
		if (layout) {
			navbarUIControlSchema.properties["layout"] = layout;
		}

		return <SchemaContainer schema={navbarUIControlSchema} />;
	}

	render() {
		if (this.props.data && this.props.data !== null && Object.keys(this.props.data).length > 0) {
			return this._getNavbarUIControlSchema();
		} else {
			return <label>No data</label>;
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onNavbarInit: (eventData) => dispatch(doNavbarInit(eventData)),
		onNavbarRefresh: (event) => dispatch(doNavbarRefresh(event.items, event.reset)),
		navItemClick: (data) => dispatch(doNavItemClick(data)),
		onNavbarCommandExecute: (event) => dispatch(doNavbarCommandExecute(event.navItemData)),
		onNavbarGetState: (event) => dispatch(doNavbarGetState(event.onData)),
	};
};

const ItsyNavbar = withReducer("NavbarWidget", reducer, mapDispatchToProps, stateJSON)(NavbarWidget);
ItsyNavbar.displayName = "NavbarWidget";

WidgetsFactory.instance.registerFactory(ItsyNavbar);
WidgetsFactory.instance.registerControls({
	navbar: "NavbarWidget",
	'itsy:navbar': "NavbarWidget"
});

export default ItsyNavbar;