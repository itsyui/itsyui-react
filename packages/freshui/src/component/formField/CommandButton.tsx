import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager } from "@itsy-ui/core";
import { Button } from 'react-bootstrap';
import * as React from "react";

const isFunction = (functionToCheck: any) => {
	return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
};
class CommandButton extends React.Component<IWidgetControlProps, {}> {

    _getControlSchemaProperties = (props) => {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(props.schema, definitions);
        return schema;
    }

	getCommandContext = (onContext: any) => {
		if (onContext && isFunction(onContext)) {
			return onContext.call(null)
		} else if (onContext) {
			return onContext;
		}
		return {};
	}

    async handleClick(evt) {
        const { commandName, onClick, onContext } = this._getControlSchemaProperties(this.props);
        if (commandName) {
            const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
            const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
            const cmd = commandManager.getCommand(commandName, {});
            try {
				const context = this.getCommandContext(onContext);
                await cmd!.execute(context, this.props.transition);
            } catch (e) {
                console.log("Command execution error: ", e);
                throw e;
            }
        } else if (onClick) {
            onClick(evt);
        }
    }

    keyHandler(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.handleClick(event)
        }
    }

    render() {
        const { title, style, alignText, iconPosition, iconName, className } = this._getControlSchemaProperties(this.props);
        const alignstyle = alignText !== undefined && alignText === "right" ? "flex-end" : alignText === "center" ? "center" : "flex-start";
        const customClass = className ? className : "";
        const customStyle = style ? style : {};
        return (
            <div className={`freshui-btn-control ${customClass}`} style={customStyle}>
                {
                    <Button variant="primary" size="sm" onClick={(e) => { this.handleClick(e); }} onKeyDown={(e) => this.keyHandler(e)} tabIndex={0} aria-label={title} >
                        {iconPosition === "startIcon" && <i className="freshui-icons">{iconName}</i>}
                        {title}
                        {this.props.children && this.props.children}
                        {iconPosition === "endIcon" && <i className="freshui-icons">{iconName}</i>}
                    </Button>
                }
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return {};
};

const C = withReducer("commandButton", mapDispatchToProps)(CommandButton);
C["displayName"] = "commandButton";

WidgetsFactory.instance.registerFactory(C);
WidgetsFactory.instance.registerControls({
    itsy_button_ui: "commandButton",
    'itsy:ui:commandbutton': "commandButton"
});
