import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import { Spinner } from "react-bootstrap";

type LoadingIndicatorUIControlProps =   IWidgetControlProps;


const LoadingIndicator = props => {
	const { isLoading, loadingMessage } = props;
	let loaderDisplay: any = {
		width: "0%",
		display: "none",
	};
	if (isLoading) {
		loaderDisplay = {
			width: "100%",
			display: "flex",
			zIndex: 10000,
		};
	}
	const customClass = props.className ? `loadingOverlay ${props.className}` : "loadingOverlay";
	const customStyle = props.style ? { ...loaderDisplay, ...props.style } : { ...loaderDisplay };
	return (
		<div className={customClass} style={customStyle}>
			<Spinner animation="border" variant="primary" />
			<div className="lodingContent">
				{loadingMessage}
			</div>
		</div>
	)
}


class LoadingIndicatorWidget extends React.Component<LoadingIndicatorUIControlProps, {}> {
	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}


	render() {
		const { loadingMessage, isLoading, className, style } = this._getControlSchemaProperties();
		return (<LoadingIndicator
			isLoading={isLoading}
			loadingMessage={loadingMessage}
			{...this.props}
			className={className}
			style={style}
		/>)
	}
}

LoadingIndicatorWidget["displayName"] = "LoadingIndicatorWidget";

WidgetsFactory.instance.registerFactory(LoadingIndicatorWidget);
WidgetsFactory.instance.registerControls({
	loadingOverlay_control: "LoadingIndicatorWidget",
	"itsy:ui:loadingoverlay": "LoadingIndicatorWidget",
});
