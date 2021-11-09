/* eslint-disable */
import { getDefaultRegistry, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import React from 'react';
import Col from 'react-bootstrap/Col';
import { getJustifyContent, getAlignItems } from '../../utils/helper'

const _getControlSchemaProperties = (props) => {
    const registry = getDefaultRegistry();
    const { definitions } = registry;
    const schema = retrieveSchema(props.schema, definitions);
    return schema;
};

const Column = function column(props) {
    const { span, style, className, hAlignment, vAlignment, schema } = _getControlSchemaProperties(props);
    let { padding } = _getControlSchemaProperties(props)
    const colSpan = span ? span : 12;
    const colClassName = className;
    const justifyContent = getJustifyContent(hAlignment, schema, style)
    const alignItems = getAlignItems(vAlignment, schema, style)
    padding = padding ? padding : schema && schema.padding ? schema.padding : null;
    const customStyle = style ? style : {};
    const display = justifyContent !== "flex-start" ? "flex" : null;
    return (<Col className={colClassName} sm={12} md={colSpan} lg={colSpan} xl={colSpan}
        style={{ ...customStyle, justifyContent, alignItems, padding, display }}>
        {props.schema.children ? props.schema.children : props.children}
    </Col>);
};

Column.displayName = 'column';

WidgetsFactory.instance.registerFactory(Column);
WidgetsFactory.instance.registerControls({
    col_control: 'column',
    'itsy:ui:column': 'column'
});