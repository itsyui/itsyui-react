import { getDefaultRegistry, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import React from 'react';
import Row from 'react-bootstrap/Row';
import { getJustifyContent, getAlignItems } from '../../utils/helper'

const _getControlSchemaProperties = (props) => {
    const registry = getDefaultRegistry();
    const { definitions } = registry;
    const schema = retrieveSchema(props.schema, definitions);
    return schema;
};

const LayoutRow = function row(props) {
    const { className, style, children, span, hAlignment, vAlignment, schema } = _getControlSchemaProperties(props);
    let { padding } = _getControlSchemaProperties(props)
    const colSpan = span ? span : 12;
    const rowClassName = className;
    const justifyContent = getJustifyContent(hAlignment, schema)
    const alignItems = getAlignItems(vAlignment, schema)
    padding = padding ? padding : schema && schema.padding ? schema.padding : null;
    const customStyle = style ? style : {};
    return (<Row className={rowClassName} style={{ ...customStyle, justifyContent, alignItems, padding }}>
        {children ? children : props.children}
    </Row>);
};

LayoutRow.displayName = 'row';

WidgetsFactory.instance.registerFactory(LayoutRow);
WidgetsFactory.instance.registerControls({
    row_control: 'row',
    'itsy:ui:row': 'row'
});