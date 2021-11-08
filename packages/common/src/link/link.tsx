import React, { Component } from 'react';
import { WidgetsFactory, SchemaContainer } from "@itsy-ui/core";

interface LinkWidgetProps {
    schema: LinkWidgetSchemaProps;
    onClick: (schema: LinkWidgetSchemaProps) => void;
    className?: string;
    style?: Object;
}

interface LinkWidgetSchemaProps {
    url: string;
    label?: string;
    className?: string;
}

class LinkWidget extends Component<LinkWidgetProps> {
    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.schema);
        }
    }
    render() {
        const schema = this.props.schema ? this.props.schema : {};
        const linkUISchema = {
            name: `link_ui_control`,
            properties: {
                ...schema,
                "ui:widget": "itsy:ui:link",
                onClick: this.onClick.bind(this),
                className: this.props.className,
                style: this.props.style
            },
        };
        return (<SchemaContainer schema={linkUISchema}>
            {this.props.children}
        </SchemaContainer>);
    }
}

LinkWidget["displayName"] = "ExternalLinkControl";

WidgetsFactory.instance.registerFactory(LinkWidget);
WidgetsFactory.instance.registerControls({
    external_link: "ExternalLinkControl",
    "itsy:link": "ExternalLinkControl"
});

export default LinkWidget;
