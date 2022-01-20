import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";

type TabItemUIControlProps =  IWidgetControlProps;


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
            tabIndex={0}
        >
            {children}
        </div>
    );
}

class TabItem extends React.Component<TabItemUIControlProps, {}>{

    _getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    render() {
        const { activeItem, data } = this._getControlSchemaProperties();
        return (
            <TabPanel value={activeItem} index={data.key} tabIndex={0}>
                <SchemaContainer key={data.key} schema={data.content} />
            </TabPanel>
        );
    }
}

TabItem["displayName"] = "TabItemUIControl";

WidgetsFactory.instance.registerFactory(TabItem);
WidgetsFactory.instance.registerControls({
    tab_item_control: "TabItemUIControl",
    "itsy:ui:tabitem": "TabItemUIControl"
});
