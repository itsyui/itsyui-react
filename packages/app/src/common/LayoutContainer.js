import { SchemaContainer, WidgetsFactory } from '@itsy-ui/core';
import React from 'react';

const LayoutContainer = function container(props) {
    const appData = props.schema.properties;
    const regions = appData.regions;
    const themeView = appData.themeView;
    const layoutType = appData.layoutType;
    const widgetName = "layout";

    const layoutSchema = {
        name: "home-layout",
        properties: {
            "ui:widget": widgetName,
            regions: regions,
            layoutType: layoutType,
            themeView: themeView,
        }
    };
    return (
        <SchemaContainer schema={layoutSchema}>
            {props.children}
        </SchemaContainer>
    );
};

LayoutContainer.displayName = 'LayoutContainer';

WidgetsFactory.instance.registerFactory(LayoutContainer);
WidgetsFactory.instance.registerControls({
    'layout_container': 'LayoutContainer',
    'itsy:applayout': 'LayoutContainer'
});

export default LayoutContainer;