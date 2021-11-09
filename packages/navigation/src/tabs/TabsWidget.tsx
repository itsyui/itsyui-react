/* eslint-disable */
import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { ITabsStateTransitionProps, ITabsWidgetStateProps } from "../navigation";
import * as React from "react";
import {
	doTabsActiveTabChange, doTabsAddNewTab, doTabsBeforeAddNewTab,
	dotabsGetState, doTabsInit, doTabsLoad,
	onTabsCloseCurrentTab, TabsActions
} from "./actions";
import reducer from "./reducer";
import "./tabItems/tabItemsWidget";
import "./tabWidgetBinding";

import stateJSON from "./state.json";

type TabsWidgetProps = ITabsWidgetStateProps & ITabsStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

enum TabTypes {
	Tab = "tab",
	TabNav = "tab-nav",
}

class TabsWidget extends React.Component<TabsWidgetProps, {}> {
	componentWillMount() {
		this.initializeTab();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.schema.designerMetadata && nextProps.schema.designerMetadata.needRefresh) {
			this.initializeTab(nextProps.schema);
		}
	}

	initializeTab(schema = null) {
		if (this.props.transition) {
			const { typeId, schemaId, relationshipViews, objectId, record, tabItems, items, designerMetadata } = this.getControlSchemaProperties();
			let tabItemsData = tabItems && Array.isArray(tabItems) && tabItems.length > 0 ? tabItems : items; //first prefer to tabItems then items (changes done for builder)
			const objectData = record !== undefined ? record : objectId;
			tabItemsData = schema && schema.items ? schema.items : tabItemsData;
			this.props.transition({
				type: TabsActions.State.TABS_INIT,
				typeId,
				schemaId,
				relationshipViews,
				objectData,
				tabItems: tabItemsData,
				designerMetadata,
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_onChange = (activeKey, tabType) => {
		if (tabType === TabTypes.TabNav) {
			this.props.transition({
				type: TabsActions.State.NAVIGATE_URL,
				url: activeKey, //Here, activeKey will be a URL
			});
		} else {
			this.props.transition({
				type: TabsActions.State.TABS_ACTIVE_TAB_CHANGE,
				activeKey: activeKey,
			});
		}
	}

	_onEdit = (targetKey, action) => {
		this[action](targetKey);
	}

	_add = () => {
		const previousTabs = this.props.tabs;
		this.props.transition({
			type: TabsActions.State.TABS_BEFORE_ADD_NEW_TAB,
			previousTabs,
		});

	}

	_remove = (targetKey) => {
		let activeKey = this.props.activeKey;
		let lastIndex;
		this.props.tabs.forEach((pane, i) => {
			if (pane.key === targetKey) {
				lastIndex = i - 1;
			}
		});
		const tabs = this.props.tabs.filter(pane => pane.key !== targetKey);
		if (lastIndex >= 0 && activeKey === targetKey) {
			activeKey = tabs[lastIndex].key;
		}
		this.props.transition({
			type: TabsActions.State.TABS_CLOSE_CURRENT_TAB,
			Tabs: tabs,
			activeKey: activeKey,
		});
	}

	_getTabsUIControlSchema() {
		const { typeId, tabType } = this.getControlSchemaProperties();
		const tabsUIControlSchema = {
			name: `tabs-ui-control-${typeId}`,
			properties: {
				"ui:widget": "tabs_control",
				activeKey: this.props.activeKey,
				handleChange: this._onChange.bind(this),
				handleEdit: this._onEdit.bind(this),
				handleAdd: this._add.bind(this),
				handleRemove: this._remove.bind(this),
				tabitems: this.props.tabs,
				className: this.props.className,
				style: this.props.style,
				tabType,
			},
		};

		return <SchemaContainer schema={tabsUIControlSchema} />;
	}

	render() {
		if (this.props.tabs !== undefined && this.props.tabs.length > 0) {
			return this._getTabsUIControlSchema();
		} else {
			return <span>No Data</span>;
		}

	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onTabsInit: (event) => dispatch(doTabsInit(event)),
		onTabsLoad: (event) => dispatch(doTabsLoad(event.data)),
		onTabsBeforeAddNewTab: (event) => dispatch(doTabsBeforeAddNewTab(event.previousTabs)),
		onTabsAddNewTab: (event) => dispatch(doTabsAddNewTab(event.Tabs, event.activeKey)),
		onTabsActiveTabChange: (event) => dispatch(doTabsActiveTabChange(event.activeKey)),
		onTabsCloseCurrentTab: (event) => dispatch(onTabsCloseCurrentTab(event.Tabs, event.activeKey)),
		ontabsGetState: (event) => dispatch(dotabsGetState(event.onData)),
	};
};

const ItsyTabsWidget = withReducer("TabsWidget", reducer, mapDispatchToProps, stateJSON)(TabsWidget);
ItsyTabsWidget.displayName = "TabsWidget";

WidgetsFactory.instance.registerFactory(ItsyTabsWidget);
WidgetsFactory.instance.registerControls({
	tabs: "TabsWidget",
	"itsy:tabs": "TabsWidget"
});

export default ItsyTabsWidget;