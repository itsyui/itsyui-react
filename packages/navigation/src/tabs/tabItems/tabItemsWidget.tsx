/* eslint-disable */
import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { ITabsStateTransitionProps, ITabsWidgetStateProps } from "../../navigation";
import * as React from "react";
import { doTabItemsInit, TabItemsActions } from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

type TabItemsWidgetProps = ITabsWidgetStateProps & ITabsStateTransitionProps & IWidgetControlProps;

class TabItemsWidget extends React.Component<TabItemsWidgetProps, {}> {

	componentWillMount() {
		if (this.props.transition) {
			const { activeItem, items } = this.getControlSchemaProperties();
			this.props.transition({
				type: TabItemsActions.State.TABITEMS_INIT,
				activeItem,
				items,
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_getTabItemUIControlSchema(data: any, index: number) {
		const { activeItem, items } = this.getControlSchemaProperties();
		const tabItemUIControlSchema = {
			name: `tabitem-ui-control`,
			properties: {
				"ui:widget": "tab_item_control",
				activeItem: activeItem,
				data: data,
			},
		};
		const itemData = tabItemUIControlSchema.properties.data;
		const contextPath = itemData && itemData["content"] && itemData["content"]["properties"] && itemData["content"]["properties"]["contextPath"] ? itemData["content"]["properties"]["contextPath"] : {};
		return (<StateManagerContext.Provider key={`tab-item-provider-${index}`} value={{ contextPath }}>
			<SchemaContainer schema={tabItemUIControlSchema}></SchemaContainer>
		</StateManagerContext.Provider>);
	}

	render() {
		if (this.props.data !== undefined && this.props.data.length > 0) {
			return this.props.data.map((item, index) => {
				return this._getTabItemUIControlSchema(item, index);
			});
		}
		return null;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onTabItemsInit: (event) => dispatch(doTabItemsInit(event)),
	};
};

const TabItemsWidgetC = withReducer("TabItemsWidget", reducer, mapDispatchToProps, stateJSON)(TabItemsWidget);
TabItemsWidgetC.displayName = "TabItemsWidget";

WidgetsFactory.instance.registerFactory(TabItemsWidgetC);
WidgetsFactory.instance.registerControls({
	tabItems: "TabItemsWidget",
	"itsy:tabitem": "TabItemsWidget"
});

export default TabItemsWidgetC;