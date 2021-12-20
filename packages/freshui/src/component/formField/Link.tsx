import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager } from "@itsy-ui/core";
import * as React from "react";
import Card from 'react-bootstrap/Card';
class LinkControl extends React.Component<IWidgetControlProps, {}> {

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	onLinkClick(commandName, contextParams) {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
		return async (_, dispatch: any, transition: any) => {
			let cmd = commandManager.getCommand(commandName, contextParams.contextPath);
			try {
				await cmd!.execute(contextParams.context, transition);
			} catch (e) {
				console.log("Command execution error: ", e);
			}
		}
	}

	render() {
		const { title, commandName, contextParams, alignText, fieldSchema } = this.getControlSchemaProperties();
		const alignstyle = alignText !== undefined && alignText === "right" ? "flex-end" : alignText === "center" ? "center" : "flex-start";
		const customClass = fieldSchema.className ? fieldSchema.className : "";
		const customStyle = fieldSchema.style ? fieldSchema.style : {};
		return (
			<div style={{ "justifyContent": alignstyle, ...customStyle }} className={`link-container ${customClass}`} tabIndex={0}>
				<Card.Link onClick={this.onLinkClick.bind(commandName, contextParams)} tabIndex={0} aria-label={fieldSchema.title ? fieldSchema.title : title}>
					{fieldSchema.title ? fieldSchema.title : title}
				</Card.Link>
			</div>
		);
	}
}

LinkControl['displayName'] = 'LinkControl';

WidgetsFactory.instance.registerFactory(LinkControl);
WidgetsFactory.instance.registerControls({
	link: 'LinkControl',
	'itsy:form:link': 'LinkControl'
});