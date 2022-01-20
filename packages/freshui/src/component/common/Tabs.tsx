import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import "./NavbarBottom";

type TabsUIControlProps = IWidgetControlProps;

enum TabTypes {
	Tab = "tab",
	TabNav = "tab-nav",
}

class TabsControl extends React.Component<TabsUIControlProps, {}>{

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	onChange = (currentKey) => {
		const { handleChange } = this._getControlSchemaProperties();
		currentKey = parseInt(currentKey)
		handleChange(currentKey);
	}

	onEdit = (targetKey, action) => {
		const { handleEdit } = this._getControlSchemaProperties();
		handleEdit(targetKey, action);
	}

	onTabNavChange = (path) => {
		const { handleChange, tabType } = this._getControlSchemaProperties();
		handleChange(path, tabType);
	}

	renderTabItems() {
		const controlProps = this._getControlSchemaProperties();
		const { tabitems, className, style } = controlProps;
		let { activeKey } = controlProps;
		activeKey = activeKey ? activeKey : 0;
		const a11yProps = (index) => {
			return {
				id: `scrollable-auto-tab-${index}`,
				'aria-controls': `scrollable-auto-tabpanel-${index}`,
			};
		}
		const tabItemsSchema = {
			name: "tab-items",
			properties: {
				"ui:widget": "tabItems",
				"items": tabitems,
				"activeItem": activeKey,
			}
		};
		return (
			<div className={className ? `tab-design-container ${className}` : "tab-design-container"} style={style ? style : {}}>
				<Tabs
					activeKey={activeKey}
					onSelect={this.onChange}
					aria-label="Tab"
					defaultActiveKey={0}
					tabIndex={0}
				>
					{
						tabitems.map((pane, i) =>
							<Tab tabIndex={0} aria-label={pane.title} key={i} title={pane.title} eventKey={pane.key} {...a11yProps(pane.key)} >
								{activeKey === i && <SchemaContainer key={pane.title} schema={tabItemsSchema} />}
							</Tab>
						)
					}
				</Tabs>
			</div>
		);
	}

	renderTabNavItems() {
		const { tabitems } = this._getControlSchemaProperties();
		const schema = {
			name: `tabs-nav-ui-control`,
			properties: {
				"ui:widget": "navbar_bottom_control",
				handleChange: this.onTabNavChange.bind(this),
				tabitems,
			},
		};
		return <SchemaContainer schema={schema} />;
	}

	render() {
		const { tabType } = this._getControlSchemaProperties();
		if (tabType === TabTypes.TabNav) {
			return this.renderTabNavItems();
		}
		return this.renderTabItems();
	}
}

TabsControl["displayName"] = "TabsUIControl";

WidgetsFactory.instance.registerFactory(TabsControl);
WidgetsFactory.instance.registerControls({
	tabs_control: "TabsUIControl",
	"itsy:ui:tabs": "TabsUIControl"
});
