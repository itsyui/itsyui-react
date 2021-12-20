import React, { Component } from 'react';
import { WidgetsFactory, getDefaultRegistry, retrieveSchema } from "@itsy-ui/core";

class ExternalLinkControl extends Component {
    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }
    render() {
        const schema = this.getControlSchemaProperties();
        const {
            url,
            label,
            className,
            style
        } = schema;
        const customClass = className ? className : "";
        const customStyle = style ? { ...style } : {};
        return (
            <a href={url} target="_blank" className={customClass} tabIndex={0} aria-label={label} style={customStyle}>{label}</a>
        );
    }
}

ExternalLinkControl["displayName"] = "LinkUIControl";

WidgetsFactory.instance.registerFactory(ExternalLinkControl);
WidgetsFactory.instance.registerControls({
    "itsy:ui:link": "LinkUIControl",
});
