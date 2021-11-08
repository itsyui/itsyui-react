import * as React from "react";
import { WidgetsFactory, getDefaultRegistry, retrieveSchema, IWidgetControlProps } from "@itsy-ui/core";
import { ILoadingOverlayStateProps } from "../feedback";

type LoadingIndicatorUIControlProps = ILoadingOverlayStateProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

class LoadingIndicator extends React.Component<LoadingIndicatorUIControlProps, {}> {
	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	render() {
		const { loadingMessage, isLoading, className, style } = this._getControlSchemaProperties();
		let loaderDisplay: any = {
			width: "0%",
			display: "none",
		};
		if (isLoading) {
			loaderDisplay = {
				width: "100%",
				display: "block",
				zIndex: 10000,
			};
		}
		const customClassName = className ? `overlay ${className}` : "overlay";
		const customStyle = style ? { ...loaderDisplay, ...style } : loaderDisplay;
		return <div className={customClassName} style={customStyle}>
			<div className="overlay-content">
				<div className="spinner">
					<div className="rect1" />
					<div className="rect2" />
					<div className="rect3" />
					<div className="rect4" />
					<div className="rect5" />
				</div>
				{loadingMessage !== undefined && loadingMessage !== "" &&
					<span style={{ fontSize: 20, color: "white" }}>{loadingMessage}</span>
				}
			</div>
		</div>;
	}
}

LoadingIndicator["displayName"] = "LoadingIndicatorUIControl";

WidgetsFactory.instance.registerFactory(LoadingIndicator);
WidgetsFactory.instance.registerControls({
	loadingOverlay_control: "LoadingIndicatorUIControl",
	'itsy:progress': "LoadingIndicatorUIControl"
});

export default LoadingIndicator;
