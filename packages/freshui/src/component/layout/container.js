/* eslint-disable */
import { getDefaultRegistry, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import React from 'react';
import { Container } from 'react-bootstrap';

const _getControlSchemaProperties = (props) => {
	const registry = getDefaultRegistry();
	const { definitions } = registry;
	const schema = retrieveSchema(props.schema, definitions);
	return schema;
};

const LayoutContainer = function content(props) {
	const { style, children, className } = _getControlSchemaProperties(props);
	const customClassName = className ? `content-container fresh-content-container-layout ${className}` : "content-container fresh-content-container-layout";
	return (<Container
		className={customClassName}
		style={style}
		fluid
	>
		{children ? children : props.children}
	</Container>);

};

LayoutContainer["displayName"] = 'content';

WidgetsFactory.instance.registerFactory(LayoutContainer);
WidgetsFactory.instance.registerControls({
	content_control: 'content'
});
